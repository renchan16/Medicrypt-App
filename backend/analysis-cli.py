from correlation import Correlation

def main():
    filepath = "/home/roel/Documents/code_projects/Medicrypt-App/backend/test_encrypt.avi"
    
    corr = Correlation(filepath)

    print(corr.get_corellation_diag(1000))

if __name__ == "__main__":
    main()