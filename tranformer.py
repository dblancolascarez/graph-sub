import json

def getTargetNode(input_data, key):
    counter=0
    for node in input_data['nodes']:
        if key==node['key']:
            return counter
        counter+=1
    return

# Function to transform the input JSON structure to the desired format
def transform_json(input_data):
    nodes = []
    links = []
    counter=0
    # Process nodes
    for node in input_data['nodes']:
        nodes.append({
            "name": node['attributes']['label'],
            "group": 1  # Assuming a default group value as the input JSON does not specify group
        })
        counter+=1
    
    # Process edges
    for edge in input_data['edges']:
        links.append({
            "source": getTargetNode(input_data,edge['source']),
            "target": getTargetNode(input_data,edge['target']),
            "value": edge['attributes']['weight']
        })

    # Construct the transformed JSON structure
    transformed_data = {
        "nodes": nodes,
        "links": links
    }
    print(counter)
    return transformed_data

# Function to read input JSON file, transform it, and write to output JSON file
def process_json_files(input_file, output_file):
    # Read input JSON file
    with open(input_file, 'r') as infile:
        input_data = json.load(infile)
    
    # Transform the input data
    transformed_data = transform_json(input_data)
    
    # Write transformed data to output JSON file
    with open(output_file, 'w') as outfile:
        json.dump(transformed_data, outfile, indent=2)

# Specify input and output file paths
input_file = 'inputdata.json'
output_file = 'outputdata.json'

# Process the JSON files
process_json_files(input_file, output_file)
