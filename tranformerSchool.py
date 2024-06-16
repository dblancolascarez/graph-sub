import json

def getTargetNode(input_data, key):
    for index, node in enumerate(input_data['nodes']):
        if key == node['key']:
            return index
    return -1  # Devolver -1 si no se encuentra el nodo

# Función para transformar la estructura del JSON
def transform_json(input_data):
    nodes = []
    links = []
    colors = []

    for node in input_data['nodes']:
        color = node["attributes"]["color"]
        if color not in colors:
            colors.append(color)
        group = colors.index(color)
        nodes.append({
            "name": node['attributes']['label'],
            "group": group  
        })

    for edge in input_data['edges']:
        source_index = getTargetNode(input_data, edge['source'])
        target_index = getTargetNode(input_data, edge['target'])
        if source_index != -1 and target_index != -1:
            links.append({
                "source": source_index,
                "target": target_index,
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
    with open(input_file, 'r', encoding='utf-8') as infile:
        input_data = json.load(infile)
    
    # Transformar
    transformed_data = transform_json(input_data)
    
    # Escribir
    with open(output_file, 'w', encoding='utf-8') as outfile:
        json.dump(transformed_data, outfile, ensure_ascii=False, indent=2)

input_file = 'inputdata.json'
output_file = 'outputdata.json'

process_json_files(input_file, output_file)
