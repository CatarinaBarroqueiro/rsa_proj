import json
import os
import requests

IPFS_API_URL = "http://127.0.0.1:9094"
METADATA_FILE = "metadata.json"

def load_metadata():
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r') as f:
            return json.load(f)
    return {}

def show_version_by_cid(cid):
    versions = load_metadata()
    found = False
    for file_path, data in versions.items():
        for index, version in enumerate(data['history']):
            if version['cid'] == cid:
                found = True
                print(f"File: {file_path}, Version {index}: CID: {version['cid']}, Message: {version['message']}, Timestamp: {version['timestamp']}")
                content = fetch_file_content(cid)
                if content:
                    print(f"\nContent of CID {cid}:\n{content}")
                break
        if found:
            break
    if not found:
        print(f"No history found for CID {cid}")

def fetch_file_content(cid):
    try:
        response = requests.get(f"{IPFS_API_URL}/cat?arg={cid}")
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch content for CID {cid}: {e}")
        return None

if __name__ == "__main__":
    # CID to check
    cid_to_check = "QmcJjNse5UvbWiEzYUUz8kCeZK8gm4DvZGLJAvnasgEWUB"
    show_version_by_cid(cid_to_check)
