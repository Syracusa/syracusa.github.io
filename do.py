
import json

dict = {'list': [
    
# Playlists
    "Lie down to bed",
    "Turn on the music",
    "Turn on Starcraft to beat commputer",
    "Turn on novel viewer",
    
# List checker
    "Look at the checklist that you should do right now",

# Houseworks
    "Pick up one trash and throw to trash bin",
    "Get one piece of watered tissue and rub something",

# Programmings
    "Look one github issues",
    "Write one line of novel",
    "Write one line of code",
    "Write one line of comment",

# Drawing
    "Draw one stroke",

# Study
    "Turn on japanese vocabulary app"

]
}

json_dump = json.dumps(dict, indent=4)
with open("dump.json", "w") as f:
    f.write(json_dump)
