import os

class FilepathParser:

    filepath = ""
    is_windows = False
    tokens = []

    def __init__(self, filepath : str):
        self.filepath = filepath

        if os.name == "nt":
            self.is_windows = True
            filepath.replace("\\", "/")
        
        self.tokens = self.filepath.split("/")
    
    def get_filename(self, exclude_file_extension=False):

        if exclude_file_extension:
            return self.tokens[-1].split(".")[0]
        return self.tokens[-1]
    
    def get_posix_path(self):
        return self.filepath
    
    def get_tokens(self):
        return self.tokens
    


