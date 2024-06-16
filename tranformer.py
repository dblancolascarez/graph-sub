import json

def getTargetNode(input_data, key):
    counter=0
    for node in input_data['nodes']:
        if key==node['key']:
            return counter
        counter+=1
    return

# Funcion para transformar la estructura del Json
def transform_json(input_data):
    nodes = []
    links = []
    colors=[]

    for node in input_data['nodes']:
        if node["attributes"]["color"] not in colors:
            colors.append(node["attributes"]["color"])
            grupo= colors.index(node["attributes"]["color"])
            nodes.append({
                "name": node['attributes']['label'],
                "group": grupo  
            })
        else:
            grupo= colors.index(node["attributes"]["color"])
            nodes.append({
                "name": node['attributes']['label'],
                "group": grupo  
            })

    for edge in input_data['edges']:
        links.append({
            "source": getTargetNode(input_data,edge['source']),
            "target": getTargetNode(input_data,edge['target']),
            "value": edge['attributes']['weight']
        })

    # Construir el nuevo JSON
    transformed_data = {
        "nodes": nodes,
        "links": links
    }
    return transformed_data

# Leer JSON y devolver nuevo JSON
def process_json_files(input_file, output_file):
    # Leer
    with open(input_file, 'r') as infile:
        input_data = json.load(infile)
    
    # Transformar
    transformed_data = transform_json(input_data)
    
    # Escribir
    with open(output_file, 'w') as outfile:
        json.dump(transformed_data, outfile, indent=2)

input_file = 'inputdata.json'
output_file = 'outputdata.json'

process_json_files(input_file, output_file)
