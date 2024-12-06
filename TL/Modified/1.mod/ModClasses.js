// EternalDev

const AppDomain = new NativeClass("System", "AppDomain");
const Assembly = new NativeClass("System.Reflection", "Assembly");

const GetAssemblies = AppDomain["Assembly[] GetAssemblies()"];
const GetTypes = Assembly["Type[] GetTypes()"];

function getAllTypes() {
    const assemblies = GetAssemblies(AppDomain.CurrentDomain);
    const allTypes = {};

    for (let i = 0; i < assemblies.length; i++) {
        const assembly = assemblies[i];
        const types = GetTypes(assembly);

        for (let j = 0; j < types.length; j++) {
            const type = types[j];
            const typeName = type.Name;
            const namespaceName = type.Namespace || "GLOBAL";

            if (!allTypes[namespaceName]) {
                allTypes[namespaceName] = new Set();
            }
            allTypes[namespaceName].add(typeName);
        }
    }
    return allTypes;
}

let allTypes = getAllTypes();
let NativeClasses = {};

function addClassToNamespace(structure, namespace, className) {
    const nativeClassInstance = new NativeClass(namespace, className);
    const namespaceParts = namespace.split('.');
    let current = structure;

    for (let i = 0; i < namespaceParts.length; i++) {
        const part = namespaceParts[i];
        if (!current[part]) {
            current[part] = {};
        }
        current = current[part];
    }
    
    current[className] = nativeClassInstance;
}

for (const namespace in allTypes) {
    const typesFromNamespace = allTypes[namespace];

    if (typesFromNamespace.size > 0) {
        for (const type of typesFromNamespace) {
            try {
                addClassToNamespace(NativeClasses, namespace, type);
            } catch (error) {
                // tl.log(`Erro ao carregar ${namespace}.${type}: ${error}`);
            }
        }
    } else {
        // tl.log(`Namespace ${namespace} não há class.`);
    }
}

export function using(...namespaces) {
    namespaces.forEach(namespace => {
    
        if (NativeClasses[namespace]) {
            const classes = NativeClasses[namespace];
            for (const className in classes) {
                const classObj = classes[className];
                globalThis[className] = classObj;
            }
        } else {
        
            const namespaceParts = namespace.split('.');
            let currentNamespace = NativeClasses;

            for (const part of namespaceParts) {
                if (currentNamespace[part]) {
                    currentNamespace = currentNamespace[part];
                } else {
                    //tl.log(`Namespace ${namespace} Not Found.`);
                    return;
                }
            }


            for (const className in currentNamespace) {
                globalThis[className] = currentNamespace[className];
            }
        }
    });
}