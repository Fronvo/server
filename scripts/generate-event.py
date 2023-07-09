####################################
##### Generates a Fronvo event #####
#####     Made by Shadofer     #####
####################################

# Get new event info
import os
import string

def convertEventType(type: int) -> str:
    if(type == 0):
        return 'noAccount'

    elif(type == 1):
        return 'account'
    
    elif (type == 2):
        return 'general'

def formatEventName(name: str) -> str:
    new_event_name = ''

    for i, letter in enumerate(name):
        # Remove whitespace
        if letter == ' ':
            continue

        # Capitalise first letter ONLY, preserve the rest of the string's casing
        elif i == 0 and letter in string.ascii_lowercase:
            new_event_name += letter.upper()

        else:
            new_event_name += letter

    return new_event_name

event_type = input('Event type [0: noAccount, 1: account, 2: general]: ')

if(not event_type):
    print('Invalid event type!')
    exit()

event_type = int(event_type)

event_type_name = convertEventType(event_type)

event_name = input('Event name: ')
event_name_title = formatEventName(event_name)

if(not event_name):
    print('Invalid event name!')
    exit()

# Start generating files
src = '../src'
target_filename = f'{event_name}.ts'
target_filename_test = f'{event_name}.test.ts'
brackets = '{}'
bracket_l = '{'
bracket_r = '}'

if(os.path.isfile(f'{src}/interfaces/{event_type_name}/{target_filename}')):
    print('Event already exists.')
    exit()

print(f'Creating *{event_type_name}* event *{event_name}*')

# Create interfaces
with open(f'{src}/interfaces/{event_type_name}/{target_filename}', 'w') as f:
    # Start with header
    f.write('// ******************** //\n')
    f.write(f'// Interfaces for the {event_name} event file.\n')
    f.write('// ******************** //\n\n')

    # Continue with imports
    f.write("import { FronvoError, EventArguments } from 'interfaces/all'\n\n");

    # Finish with the interface implementations
    f.write(f'export interface {event_name_title}Params {brackets}\n\n')

    f.write(f'export interface {event_name_title}ServerParams extends EventArguments, {event_name_title}Params {brackets}\n\n')

    f.write(f'export interface {event_name_title}Result {brackets}\n\n')

    f.write(f'export interface {event_name_title}TestResult extends FronvoError, {event_name_title}Result {brackets}\n')

new_file_contents = ''

with open(f'{src}/interfaces/events/c2s.ts', 'r') as f:
    event_file_contents = f.readlines()

    # After the last import
    for i, line in enumerate(event_file_contents):
        if('import' in line):
            if('import' in event_file_contents[i + 1] or 'import' in event_file_contents[i + 2] or 'import' in event_file_contents[i + 3] or 'import' in event_file_contents[i + 4]):
                continue

            else:
                # After last import, i + 1
                event_file_contents.insert(i + 4, f"import {bracket_l} {event_name_title}Params, {event_name_title}TestResult {bracket_r} from 'interfaces/{event_type_name}/{event_name}';\n")
                break;


    event_file_contents.insert(len(event_file_contents) - 1, f'    {event_name}: (\n')
    event_file_contents.insert(len(event_file_contents) - 1, f'        {brackets}: {event_name_title}Params,\n')
    event_file_contents.insert(len(event_file_contents) - 1, f'        callback?: ({brackets}: {event_name_title}TestResult) => void\n')
    event_file_contents.insert(len(event_file_contents) - 1, f'    ) => void;\n')

    for line in event_file_contents:
        new_file_contents += line

with open(f'{src}/interfaces/events/c2s.ts', 'w') as f:
    f.write((new_file_contents))

# Create event file
with open(f'{src}/events/{event_type_name}/{target_filename}', 'w') as f:
    # Start with header
    f.write('// ******************** //\n')
    f.write(f'// The {event_name} {event_type_name} event file.\n')
    f.write('// ******************** //\n\n')

    # Continue with imports
    f.write(f"import {bracket_l} {event_name_title}Result, {event_name_title}ServerParams {bracket_r} from 'interfaces/{event_type_name}/{event_name}';\n");
    f.write("import { EventTemplate, FronvoError } from 'interfaces/all';\n\n");

    # Then the event function
    f.write(f'async function {event_name}({brackets}: {event_name_title}ServerParams): Promise<{event_name_title}Result | FronvoError> {bracket_l}\n')

    f.write(f'''    return {brackets};\n''')
    f.write(f'{bracket_r}\n\n')

    # Finally, create the event template
    f.write(f'const {event_name}Template: EventTemplate = {bracket_l}\n')

    f.write(f'''    func: {event_name},\n''')
    f.write(f'''    template: [],\n''')
    
    f.write(f'{bracket_r};\n\n')

    # Export it
    f.write(f'export default {event_name}Template;')

# Add to registered events
new_file_contents = ''

with open(f'{src}/events/{event_type_name}.ts', 'r') as f:
    event_file_contents = f.readlines()

    # After the last import
    for i, line in enumerate(event_file_contents):
        if('import' in line):
            if('import' in event_file_contents[i + 1]):
                continue

            else:
                # After last import, i + 1
                event_file_contents.insert(i + 1, f"import {event_name} from 'events/{event_type_name}/{event_name}';\n")
                event_file_contents.insert(len(event_file_contents) - 3, f'''    {event_name},\n''')
                break;

    for line in event_file_contents:
        new_file_contents += line

with open(f'{src}/events/{event_type_name}.ts', 'w') as f:
    f.write(new_file_contents)

print(f'Event *{event_name}* created successfully')
