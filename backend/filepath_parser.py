import os

class FilepathParser:

    filepath = ""
    is_windows = False
    tokens = []

    def __init__(self, filepath : str):
        self.filepath = filepath

        if os.name == "nt": #please test this
            self.is_windows = True
            filepath.replace("\\", "/")
            filepath.replace(" ", "\\ ")
        
        self.tokens = self.filepath.split("/")
    
    def get_filename(self, exclude_file_extension=False):

        if exclude_file_extension:
            return self.tokens[-1].split(".")[0]
        return self.tokens[-1]
    
    def get_posix_path(self):
        return self.filepath
    
    def get_tokens(self):
        return self.tokens
    
    def get_dir_only(self):
        return self.filepath[:len(self.filepath) - len(self.get_filename())]
    


