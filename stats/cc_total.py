import numpy as np
import csv
import os

x = np.float128(2.448076415252821e-14)

for i in next(os.walk('.'))[1]: #resolution
    if i == 'csv':
        continue

    for j in next(os.walk(f"./{i}"))[1]: #algorithm
        
        with open(f"./CC_E_{i}_{j}.csv", 'w', newline='') as reso_csv:

            writer = csv.writer(reso_csv)

            writer.writerow(['file', 'CC_d', 'CC_h', 'CC_v'])

            for k in next(os.walk(f"./{i}/{j}/metrics"))[2]: #files
                print(f"./{i}/{j}/metrics/{k}")

                total_d, total_h, total_v = np.float128(0), np.float128(0), np.float128(0)

                with open(f"./{i}/{j}/metrics/{k}") as csvfile:
                    reader = csv.DictReader(csvfile)

                    for row in reader:
                        if row['Frame'] == 'Total' or row['Frame'] == 'Mean':
                            continue
                        print(f"{k}: {row['CC_d_e']}")

                        total_d += np.float128(row['CC_d_e'])
                        total_h += np.float128(row['CC_h_e'])
                        total_v += np.float128(row['CC_v_e'])
                
                writer.writerow([k, total_d, total_h, total_v])  # write the data


                
                