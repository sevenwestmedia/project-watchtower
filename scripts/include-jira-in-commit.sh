#!/bin/sh

JIRA_IN_MSG=$(head -n 1 ${1} | grep -e '[A-Z]\+-[0-9]\+' -o)

# Check if message has a jira number referenced already (-z checks empty)
if [ -z "$JIRA_IN_MSG" ]; then
    # Get story number from branch name
    STORY_NUMBER=$(git symbolic-ref --short HEAD | grep -e '[A-Z]\+-[0-9]\+' -o)

    if [[ ! -z "$STORY_NUMBER" ]]; then
        echo "$STORY_NUMBER: $(cat ${1})"> ${1}
    fi
fi
