import requests

api_endpoint = "http://127.0.0.1:9094"

def share_document(file_path, file_name):
    try:
        with open(file_path, "rb") as file:
            files = {"file": (file_name, file, 'application/octet-stream')}
            
            response = requests.post(f"{api_endpoint}/add", files=files)

            if response.status_code == 200:
                response_data = response.json()
                cid = response_data["cid"]
                print(f"Document '{file_name}' added to the cluster successfully. CID: {cid}")
            else:
                print(f"Failed to add document '{file_name}' to the cluster. Status code: {response.status_code}")
                print(response.text)
    except Exception as e:
        print(f"An error occurred: {str(e)}")

# # Path to the file
# file_path = "rsa.json"
# file_name = "rsa.json"  # Adjust the file name as needed

# # Share the document
# share_document(file_path, file_name)
