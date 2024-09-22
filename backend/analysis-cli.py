from correlation import Correlation
import numpy

def main():
    filepath = "/home/roel/Documents/code_projects/Medicrypt-App/tests/testavi.avi"
    
    corr = Correlation(filepath)

    corr_list = numpy.array(corr.get_corellation_vertical(10000))

    corr_single = []
    for i in corr_list:
        
        corr_single.append(i[0])
    
    corr_single = numpy.array(corr_single)

    print(corr_single.mean())


if __name__ == "__main__":
    main()