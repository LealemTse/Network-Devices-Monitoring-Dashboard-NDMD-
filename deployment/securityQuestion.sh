#! /bin/bash

qestions=(
	"what was the first shool you attended at"
	"what is your mothets father name"
	"what was you fav english teacher"
)
declare -A usr_answer

echo "select 2 sequrity question"

for (( i=1; i<=2 ; i++))
do
	echo "Selected question #$i:"
	for index in "${!qestions[@]}"; do
		if [[ -n "$qestions[$index]}" ]] then
			echo "$((index+1)) ${qestions[$index]}"
		fi
	done

	read -p "select a question: " choice
	idx=$((choice-1))
	if [[ -z "${qestions[$idx]}" || $choice -lt 1 || $choice -gt 5 ]]; then
		echo "Invalid "
		((i--))
		continue
	fi

	sel_question="${qestions[$idx]}"
	read -p "Answer is: " answer
	usr_answer["$sel_question"]=$answer

	unset 'questions[$idx]'
done

echo ""
echo "security passwords saved"
echo "summary of questions"
for q in "${!usr_answer[@]}"; do
	echo "Q: $q"
	echo "A: ${usr_answer[$q]}"
done
