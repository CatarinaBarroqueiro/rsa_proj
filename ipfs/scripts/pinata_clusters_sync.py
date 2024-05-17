import os
import requests
from dotenv import load_dotenv
import pprint

# Load environment variables
load_dotenv()

# Função para obter a lista de arquivos presentes na Pinata
def get_pinata_file_list(jwt_token):
    url = "https://api.pinata.cloud/data/pinList"
    headers = {'Authorization': f'Bearer {jwt_token}'}
    response = requests.get(url, headers=headers)
    return response.json()

# Função para mapear os nomes de arquivo para seus CIDs correspondentes
def map_file_name_to_cid(pin_list):
    file_name_to_cid = {}
    for item in pin_list['rows']:
        file_name = item['metadata']['name']
        cid = item['ipfs_pin_hash']
        file_name_to_cid[file_name] = cid
    return file_name_to_cid

# Função para fazer upload de um arquivo para um cluster IPFS
def upload_to_cluster(node_url, filepath, jwt_token):
    url = f"{node_url}/add"
    headers = {'Authorization': f'Bearer {jwt_token}'}
    with open(filepath, 'rb') as file:
        files = {'file': file}
        response = requests.post(url, files=files, headers=headers)
        if response.status_code == 200:
            print(f"Uploaded {filepath} to {node_url}")
        else:
            print(f"Failed to upload {filepath} to {node_url}. Status code: {response.status_code}")

# Função para deletar um arquivo de um cluster IPFS
def delete_from_cluster(node_url, cid, jwt_token):
    url = f"{node_url}/pin/rm/{cid}"
    headers = {'Authorization': f'Bearer {jwt_token}'}
    response = requests.delete(url, headers=headers)
    if response.status_code == 200:
        print(f"Deleted CID: {cid} from {node_url}")
    else:
        print(f"Failed to delete CID: {cid} from {node_url}. Status code: {response.status_code}")

# Função para sincronizar arquivos entre Pinata e clusters
def sync_files(pinata_jwt_token, clusters):
    # Obter a lista de arquivos na Pinata
    pinata_file_list = get_pinata_file_list(pinata_jwt_token)
    pinata_file_map = map_file_name_to_cid(pinata_file_list)

    # Iterar sobre os clusters
    for cluster_name, cluster_url in clusters.items():
        # Upload de arquivos presentes na Pinata, mas não no cluster
        for filename, cid in pinata_file_map.items():
            if not os.path.exists(filename):
                continue
            upload_to_cluster(cluster_url, filename, pinata_jwt_token)
        
        # Deletar arquivos do cluster que não estão na Pinata
        for filename in os.listdir('.'):
            if filename not in pinata_file_map:
                delete_from_cluster(cluster_url, filename, pinata_jwt_token)

# Lista de clusters IPFS
clusters = {
    'cluster0': 'http://192.168.1.100:5001',
    'cluster1': 'https://cluster1.example.com',
}

# JWT token da Pinata
pinata_jwt_token = os.getenv('PINATA_JWT_TOKEN')

# Sincronizar arquivos entre Pinata e clusters
sync_files(pinata_jwt_token, clusters)
