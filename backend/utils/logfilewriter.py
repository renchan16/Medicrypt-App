def logwrite(logs: list, log_source: str):

    with open(log_source, 'w') as log:
        for i in logs:
            log.write(str(i) + '\n')
