import json

def compare_pinata_and_cid(pinata_file, cid_file):
    with open(pinata_file, 'r') as pinata_json_file:
        pinata_data = json.load(pinata_json_file)
    
    with open(cid_file, 'r') as cid_json_file:
        cid_data = json.load(cid_json_file)

    pinata_cids = set(map(lambda x: x['ipfs_pin_hash'], pinata_data['rows']))


    cid_cids = set(map(lambda x: x['cid'], cid_data['pins']))


    common_cids = pinata_cids.intersection(cid_cids)

    if common_cids:
        print("CID data found in both Pinata and CID files:")
        for cid in common_cids:
            print(f"The CID {cid} is present in both Pinata and CID files.")
    else:
        print("No common CID data found between Pinata and CID files.")

# Example usage
pinata_file = 'pinata_data.json'
cid_file = 'cid.json'
compare_pinata_and_cid(pinata_file, cid_file)
