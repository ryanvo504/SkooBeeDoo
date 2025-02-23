# This file contains various functions used multiple times throughout the project. It is imported in other scripts to avoid code duplication.
import os
import inspect
import geopandas as gpd

def make_output_path(file_name):
    """
    Create the output path to save a file in the output folder, orgaized in the same way as the code folder.
    """

    # get the name of the current file
    current_script_path = inspect.stack()[1].filename
    print(current_script_path)

    # remove the extension
    current_script_path = os.path.splitext(current_script_path)[0]
    print(current_script_path)

    # edit the current script path to replace the folder "code" the folder "output"
    output_path = current_script_path.replace("code", "output")
    print(output_path)

    # create the output folder if it does not exist
    if not os.path.exists(output_path):
        os.makedirs(output_path)

    # create the output path
    output_path = os.path.join(output_path, file_name)

    return output_path

def get_data_root():
    """
    Get the root of the data folder.
    """

    # if you're local, just return the path to the data folder in the CP_irrigation_classifier repository that the code folder you are calling this from is in
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/data/'


    return root
