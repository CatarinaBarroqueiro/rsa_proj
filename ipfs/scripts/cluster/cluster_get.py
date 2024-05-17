import requests

api_url = "http://127.0.0.1:9094/pins"

def list_pinned_files():
    try:
        response = requests.get(api_url)

        if response.status_code == 200:
            pin_data = response.json()
            if "peer_map" in pin_data:
                print(f"CID: {pin_data["cid"]}")
                print(f"Name: {pin_data["name"]}")
                for peer_id, peer_info in pin_data["peer_map"].items():
                    print(f"Peer ID: {peer_id}")
                    print(f"Peer Name: {peer_info['peername']}")
                    print(f"IPFS Peer ID: {peer_info['ipfs_peer_id']}")
                    print(f"Status: {peer_info['status']}")

            else:
                print("No pinned files found.")
        else:
            print(f"Failed to list pinned files. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error listing pinned files: {e}")

list_pinned_files()
