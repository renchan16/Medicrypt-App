ENC_CLI_PATH=""
ANALYSIS_CLI_PATH=""
VENV_PATH=""


. "$VENV_PATH"

raw_dir="$(ls -d -- */)"

readarray -t dirs <<< "$raw_dir" 

trap cleanup INT

trap error ERR

function cleanup () {
    echo "User cancelled script.  Cleaning up..."
    find . -name frameGen_temp -type d -exec rm -rf {} +
    exit
}

function error () {
    echo "Error Detected"
    exit
}

for dir in "${dirs[@]}" ; do

    modes=("fisher-yates" "3d-cosine")

    for mode in "${modes[@]}"; do
        #creates an "fisher-yates" and "3d-cosine" folder if it does not exists
        mkdir -p "$dir/$mode"
        mkdir -p "$dir/$mode/encrypted"
        mkdir -p "$dir/$mode/encrypted/logtime"
        mkdir -p "$dir/$mode/decrypted"
        mkdir -p "$dir/$mode/decrypted/logtime"
        mkdir -p  "$dir/$mode/key"
        mkdir -p "$dir/$mode/metrics"
        
        raw_files="$(find "$dir" -maxdepth 1 -type f)"
        readarray -t files <<< "$raw_files"
        #loops through list of files and checks if the file exist in done.txt
        for file in "${files[@]}"
        do
            #performs video encryption and decryption in 50 frames and stores in its respective folder for each encryption type
            #fisher-yates
            fname=$(basename "${file%.*}")

            e_output="${dir}${mode}/encrypted/$fname.avi"
            d_output="${dir}${mode}/decrypted/$fname.mp4"
            k_output="${dir}${mode}/key/$fname.key"
            m_output="${dir}${mode}/metrics/$fname.csv"
            et_output="${dir}${mode}/encrypted/logtime/${fname}_etime.txt"
            dt_output="${dir}${mode}/decrypted/logtime/${fname}_dtime.txt"
            done_file="${dir}${mode}/done.txt"

            if [ -f "$done_file" ]; then
                done_list=$(cat "$done_file")
                if [[ $done_list =~ $(printf '%q' "$fname") ]]; then
                    echo "File: \"$fname\" already done in $mode encryption"
                    continue
                fi
            fi

            echo "Encrypting: \[$fname\] in \"$mode\" mode"

            python "$ENC_CLI_PATH" encrypt \
                -i "$file" \
                -o "$e_output" \
                -t "${mode}" \
                -p "12345" \
                -k "$k_output" \
                --storetime "$et_output" \
                --frames 50 \
                 --verbose

            echo "Decrypting: \[$fname\] in \"$mode\" mode"

            python "$ENC_CLI_PATH" decrypt \
                -i "$e_output" \
                -o "$d_output" \
                -t "${mode}" \
                -p "12345" \
                -k "$k_output" \
                --storetime "$dt_output" \
                --frames 50 \
                --verbose

            #runs analysis and stores the resulting data into the "metrics" folder
            echo "Performing Analysis: \[$fname\] in \"$mode\" mode"
            python "$ANALYSIS_CLI_PATH" \
            -o "$file" \
            -e "$e_output" \
            -d "$d_output"  \
            -p "12345" \
            -m all \
            --etime "$et_output" \
            --dtime "$dt_output" \
            -w "$m_output" \
            -t "${mode}" \
            --verbose

            #stores the current file into done.txt
            echo "$fname" >> "$done_file"
            
        done
    done
done

echo "PROCESS COMPLETED"
