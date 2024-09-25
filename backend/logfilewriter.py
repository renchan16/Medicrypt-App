import os


def logwrite(logs: list, log_source: str):
    logfile_name = os.path.splitext(os.path.basename(str(log_source)))[0]   # extract the filename to associate with log
    log = open(rf"..\logs\{logfile_name}.txt", 'w')
    log.write(str(logs))

    log.close()
