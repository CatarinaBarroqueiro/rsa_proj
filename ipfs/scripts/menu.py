import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from pinata_get import upload_to_pinata
from pinata_post import retrieve_from_pinata
from pinata_delete import fetch_pinata_pin_list, construct_file_name_to_cid_map, delete_file_from_pinata

def show_menu():
    print("===== Pinata API Menu =====")
    print("1. Upload file to Pinata")
    print("2. Retrieve file from Pinata")
    print("3. Delete file from Pinata")
    print("4. Exit")

def main():
    while True:
        show_menu()
        choice = input("Enter your choice (1-4): ")

        if choice == '1':
            PINATA_JWT_TOKEN = os.getenv('PINATA_JWT_TOKEN')
            upload_to_pinata(PINATA_JWT_TOKEN)
        elif choice == '2':
            PINATA_JWT_TOKEN = os.getenv('PINATA_JWT_TOKEN')
            FILE_PATH = input("Enter the file path: ")
            retrieve_from_pinata(FILE_PATH, PINATA_JWT_TOKEN)
        elif choice == '3':
            PINATA_JWT_TOKEN = os.getenv('PINATA_JWT_TOKEN')
            pin_list = fetch_pinata_pin_list(PINATA_JWT_TOKEN)
            file_name_to_cid = construct_file_name_to_cid_map(pin_list)
            print("File Name to CID Mapping:")
            for file_name, cid in file_name_to_cid.items():
                print(f"{file_name}: {cid}")
            file_name_to_delete = input("Enter the file name to delete: ")
            if file_name_to_delete in file_name_to_cid:
                cid_to_delete = file_name_to_cid[file_name_to_delete]
                delete_file_from_pinata(PINATA_JWT_TOKEN, cid_to_delete)
            else:
                print(f"File '{file_name_to_delete}' not found in the Pinata pin list.")
        elif choice == '4':
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please enter a number between 1 and 4.")

if __name__ == "__main__":
    main()
