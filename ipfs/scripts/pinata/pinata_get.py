import requests
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()


def upload_to_pinata(jwt_token):
    url = "https://api.pinata.cloud/data/pinList"
    headers = {'Authorization': f'Bearer {jwt_token}'}

    response = requests.get(url, headers=headers)

    return response.json()
    

PINATA_JWT_TOKEN = os.getenv('PINATA_JWT_TOKEN')

pinata_data = upload_to_pinata(PINATA_JWT_TOKEN)

# Write the Pinata data to a JSON file
with open('pinata_data.json', 'w') as json_file:
    json.dump(pinata_data, json_file, indent=4)

print("Pinata data written to pinata_data.json successfully.")
