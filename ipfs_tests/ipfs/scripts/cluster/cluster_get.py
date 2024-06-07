import requests
import json

api_url = "http://127.0.0.1:9094/pins"

def list_pinned_files():
    try:
        response = requests.get(api_url)

        if response.status_code == 200:
            pin_data = response.json()
            if "peer_map" in pin_data:
                data = {"pins": []}
                for peer_id, peer_info in pin_data["peer_map"].items():
                    pin_entry = {
                        "cluster": peer_info["peername"],
                        "cid": pin_data["cid"]
                    }
                    data["pins"].append(pin_entry)

                with open("cid.json", "w") as f:
                    json.dump(data, f, indent=4)

                print("Pinned files data written to cid.json successfully.")
            else:
                print("No pinned files found.")
        else:
            print(f"Failed to list pinned files. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error listing pinned files: {e}")

list_pinned_files()
