import requests

# Define the IPFS Cluster API endpoint
api_endpoint = "http://127.0.0.1:9094"

# Function to share a document
def share_document(file_path):
    try:
        # Open the file
        with open(file_path, "rb") as file:
            # Prepare the files dictionary with the file content
            files = {"file": file}
            
            # Make the POST request to add the document to the cluster
            response = requests.post(f"{api_endpoint}/add", files=files)

            # Check if the request was successful
            if response.status_code == 200:
                # Parse the response JSON
                response_data = response.json()
                # Extract the CID of the added content
                cid = response_data["cid"]
                print(f"Document added to the cluster successfully. CID: {cid}")
            else:
                print(f"Failed to add document to the cluster. Status code: {response.status_code}")
                print(response.text)
    except Exception as e:
        print(f"An error occurred: {str(e)}")

# Path to the file
file_path = "rsa.json"

# Share the document
share_document(file_path)
