import os
import requests
import json
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

IPFS_API_URL = "http://127.0.0.1:5001/api/v0"
METADATA_FILE = "metadata.json"

class VersionControl:
    def __init__(self, repo_path):
        self.repo_path = repo_path
        self.versions = self.load_metadata()

    def add_to_ipfs(self, file_path):
        with open(file_path, 'rb') as file:
            response = requests.post(f"{IPFS_API_URL}/add", files={'file': file})
            if response.status_code == 200:
                cid = response.json()['Hash']
                return cid
            else:
                print(f"Failed to add file to IPFS: {response.text}")
                return None

    def track_file(self, file_path):
        if not os.path.exists(file_path):
            # Create an empty file if it doesn't exist
            open(file_path, 'w').close()
            print(f"Created file {file_path}")
        
        cid = self.add_to_ipfs(file_path)
        if cid:
            self.versions[file_path] = {'cid': cid, 'history': []}
            print(f"Tracked file {file_path} with CID {cid}")
            self.save_metadata()
        else:
            print(f"Failed to track file {file_path}")

    def commit(self, file_path, message):
        if file_path not in self.versions:
            print(f"File {file_path} is not tracked")
            return

        cid = self.add_to_ipfs(file_path)
        if cid:
            version_info = {
                'cid': cid,
                'message': message,
                'timestamp': time.time()
            }
            self.versions[file_path]['history'].append(version_info)
            self.versions[file_path]['cid'] = cid
            print(f"Committed file {file_path} with CID {cid}")
            self.save_metadata()
        else:
            print(f"Failed to commit file {file_path}")

    def get_version(self, file_path, version_index):
        if file_path in self.versions and len(self.versions[file_path]['history']) > version_index:
            version_info = self.versions[file_path]['history'][version_index]
            print(f"Version {version_index} of {file_path} - CID: {version_info['cid']}, Message: {version_info['message']}")
            return version_info['cid']
        else:
            print(f"No version {version_index} found for file {file_path}")
            return None

    def save_metadata(self):
        with open(METADATA_FILE, 'w') as f:
            json.dump(self.versions, f, indent=4)

    def load_metadata(self):
        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, 'r') as f:
                return json.load(f)
        return {}

class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, vcs):
        self.vcs = vcs

    def on_modified(self, event):
        if not event.is_directory:
            print(f"Detected change in {event.src_path}")
            self.vcs.commit(event.src_path, "Auto-commit on modification")

if __name__ == "__main__":
    repo_path = "./repo"
    os.makedirs(repo_path, exist_ok=True)
    vcs = VersionControl(repo_path)
    
    # Track a file (you can call this multiple times for multiple files)
    file_to_track = os.path.join(repo_path, "example.txt")
    vcs.track_file(file_to_track)
    
    # Manually commit a file
    vcs.commit(file_to_track, "Initial commit")

    # Modify the file to simulate a change
    with open(file_to_track, 'a') as f:
        f.write("\nNew content added to simulate a change.")

    # Manually commit the change
    vcs.commit(file_to_track, "Added new content")

    # Retrieve the versions
    vcs.get_version(file_to_track, 0)
    vcs.get_version(file_to_track, 1)
    
    # Set up a file observer to auto-commit on changes
    event_handler = FileChangeHandler(vcs)
    observer = Observer()
    observer.schedule(event_handler, repo_path, recursive=True)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
