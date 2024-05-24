"""
`Utils.py` is a file that contains utility functions that are used in the project
"""

def check_dict_fields(msg: dict , expectedFields: list[str]) -> bool:
    """
    Function to check if the given dictionaries has the expected keys
    Args:
        - msg: given dictionary
        - expectedFields: list with the expected keys
    Returns:
        - bool: True if all the expected keys are in the dictionary, False otherwise
    """
    for f in expectedFields:
        if f not in msg.keys():
            return False
    return True