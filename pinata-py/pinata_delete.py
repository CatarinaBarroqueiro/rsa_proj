import requests
import os
from dotenv import load_dotenv
import pprint

# Load environment variables
load_dotenv()

def fetch_pinata_pin_list(jwt_token):
    url = "https://api.pinata.cloud/data/pinList"
    headers = {'Authorization': f'Bearer {jwt_token}'}
    response = requests.get(url, headers=headers)
    return response.json()
    
def construct_file_name_to_cid_map(pin_list):
    file_name_to_cid = {}
    for item in pin_list['rows']:
        file_name = item['metadata']['name']
        cid = item['ipfs_pin_hash']
        file_name_to_cid[file_name] = cid
    return file_name_to_cid

def delete_file_from_pinata(jwt_token, cid):
    url = f"https://api.pinata.cloud/pinning/unpin/{cid}"
    headers = {'Authorization': f'Bearer {jwt_token}'}
    response = requests.delete(url, headers=headers)
    return response.status_code

# Load Pinata JWT token from environment variables
PINATA_JWT_TOKEN = os.getenv('PINATA_JWT_TOKEN')

# Fetch Pinata pin list
pin_list = fetch_pinata_pin_list(PINATA_JWT_TOKEN)

# Construct the file name to CID mapping
file_name_to_cid = construct_file_name_to_cid_map(pin_list)

# Print the mapping
print("File Name to CID Mapping:")
pprint.pprint(file_name_to_cid)

# Example: Delete a file named "example.txt"
file_name_to_delete = "test.jpg"
if file_name_to_delete in file_name_to_cid:
    cid_to_delete = file_name_to_cid[file_name_to_delete]
    delete_status = delete_file_from_pinata(PINATA_JWT_TOKEN, cid_to_delete)
    if delete_status == 200:
        print(f"File '{file_name_to_delete}' deleted successfully.")
    else:
        print(f"Failed to delete file '{file_name_to_delete}'. Status code: {delete_status}")
else:
    print(f"File '{file_name_to_delete}' not found in the Pinata pin list.")
