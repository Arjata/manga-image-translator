#! /usr/bin/bash
source /etc/profile
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/userroot/lib/anaconda3/bin/conda' 'shell.bash' 'hook' 2>/dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/userroot/lib/anaconda3/etc/profile.d/conda.sh" ]; then
        . "/userroot/lib/anaconda3/etc/profile.d/conda.sh"
    else
        export PATH="/userroot/lib/anaconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<
conda activate manga-image-translator

DIR=$(dirname $0)
echo "DIR:"${DIR}
node ${DIR}"/../src/enter/handleMulti-dir.js" "-m" "/userroot/service_rely/manga-image-translator_multiDir/config/multiDir.json" > /tmp/serivesLog.manga-image-translator_multiDir.log
