from correlation import Correlation
from differential import Differential
import numpy

def main():
    filepath = "/home/roel/Documents/code_projects/Medicrypt-App/tests/testavi.avi"

    diff = Differential()
    print(diff.get_differential(filepath))

if __name__ == "__main__":
    main()