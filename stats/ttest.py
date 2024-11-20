from ctypes import c_char_p
from math import sqrt
from operator import le
import numpy as np
import scipy.stats as sc
import csv
import os

for i in next(os.walk('.'))[1]: #resolution
    if i == 'csv':
        continue

    
    with open(f"./T_TEST_{i}.csv", 'w', newline='') as ttest_csv:
            
            fieldnames = ['metrics', 'df', 'mean-diff', 'std', 't-value', 'p-value']
            writer = csv.writer(ttest_csv)
            writer.writerow(fieldnames)

            field_init = False

            
            x1_data = {}
            x2_data = {}


            for k in next(os.walk(f"./{i}/3d-cosine/metrics"))[2]: #files
                print(f"./{i}/3d-cosine/metrics/{k}")


                with open(f"./{i}/3d-cosine/metrics/{k}") as x1_metrics:
                    with open(f"./{i}/fisher-yates/metrics/{k}") as x2_metrics:

                        x1_reader = csv.DictReader(x1_metrics)
                        x2_reader = csv.DictReader(x2_metrics)

                        if not field_init:
                            for key in x1_reader.fieldnames:
                                if key == 'Frame': continue
                                x1_data[key] = []
                            for key in x2_reader.fieldnames:
                                if key == 'Frame': continue
                                x2_data[key] = []
                            field_init = True

                        for row in x1_reader:
                            if row['Frame'] != 'Mean':
                                continue
                            for key in x1_reader.fieldnames:
                                if key == 'Frame': continue
                                x1_data[key].append(np.float128(row[key]))
                        
                        for row in x2_reader:
                            if row['Frame'] != 'Mean':
                                continue
                            for key in x2_reader.fieldnames:
                                if key == 'Frame': continue
                                x2_data[key].append(np.float128(row[key]))

            print(x1_data)
            print(x2_data)

            for key in x1_data.keys():
                t_value = sc.ttest_rel(x1_data[key], x2_data[key])
                mean_diff = np.mean(np.subtract(x1_data[key], x2_data[key]))
                std = np.std(np.subtract(x1_data[key], x2_data[key]), ddof=1)
                writer.writerow([key, t_value.df, mean_diff, std, t_value.statistic, t_value.pvalue])
                