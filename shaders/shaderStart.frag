#version 410 core

in vec3 fNormal;
in vec4 fPosEye;
in vec2 fTexCoords;
in vec4 fPosLightSpace;
in vec3 lightPosEye;
in vec3 firePosEye;


out vec4 fColor;

//fog 
uniform float fogDensity;

//lighting
uniform	vec3 lightDir;
uniform	vec3 lightColor;

uniform bool night;

//point light
uniform vec3 pointLight;
uniform vec3 pointLightColor;

//fire point light
uniform vec3 fireLight;
uniform vec3 fireLightColor;
uniform float i1;
uniform float i2;


//texture
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;

uniform sampler2D shadowMap;

vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float shininess = 32.0f;


float constant = 1.0f;
float linear = 0.0045f;
float quadratic = 0.0075f;


float computeFog()
{
 float fragmentDistance = length(fPosEye);
 float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));

 return clamp(fogFactor, 0.0f, 1.0f);
}

float computeShadow(){
	// perform perspective divide
	vec3 normalizedCoords = fPosLightSpace.xyz / fPosLightSpace.w;

	// Transform to [0,1] range
	normalizedCoords = normalizedCoords * 0.5 + 0.5;

	// Get closest depth value from light's perspective
	float closestDepth = texture(shadowMap, normalizedCoords.xy).r;

	// Get depth of current fragment from light's perspective
	float currentDepth = normalizedCoords.z;

	if (normalizedCoords.z > 1.0f)
		return 0.0f;

	// Check whether current frag pos is in shadow
	//float shadow = currentDepth > closestDepth ? 1.0 : 0.0;

	// Check whether current frag pos is in shadow
	float bias = 0.005f;
	float shadow = currentDepth - bias > closestDepth ? 1.0f : 0.0f;

	return shadow;
}

void computeLightComponents()
{		
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin
	
	//transform normal
	vec3 normalEye = normalize(fNormal);	
	
	//compute light direction
	vec3 lightDirN = normalize(lightDir);
	
	//compute view direction 
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
		
	//compute ambient light
	ambient = ambientStrength * lightColor;
	
	//compute diffuse light
	diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
	
	//compute specular light
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
	specular = specularStrength * specCoeff * lightColor;
}


void computePointLight(){

	//transform normal
	vec3 normalEye = normalize(fNormal);

	//compute view direction 
	vec3 viewDirN = normalize(-fPosEye.xyz);

	//compute light direction
	vec3 lightDirN = normalize(lightPosEye - fPosEye.xyz);

	//compute specular light
	vec3 reflection = normalize(reflect(lightDirN, normalEye));
	float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
	
	//compute distance to light
	float dist = length(lightPosEye - fPosEye.xyz);
	//compute attenuation
	float att = 1.0f / (constant + linear * dist + quadratic * (dist * dist));

	//compute ambient light
	vec3 ambientAux = att * ambientStrength * pointLightColor * texture(diffuseTexture, fTexCoords).rgb;

	//compute diffuse light
	vec3 diffuseAux = att * max(dot(normalEye, lightDirN), 0.0f) * pointLightColor * texture(diffuseTexture, fTexCoords).rgb;

	vec3 specularAux = att * specularStrength * specCoeff * pointLightColor * texture(specularTexture, fTexCoords).rgb;

	ambient = ambient + ambientAux;
	diffuse = diffuse + diffuseAux;
	specular = specular + specularAux;
}



void computeFirePointLight(){

	//transform normal
	vec3 normalEye = normalize(fNormal);

	//compute view direction 
	vec3 viewDirN = normalize(-fPosEye.xyz);

	//compute light direction
	vec3 lightDirN = normalize(firePosEye - fPosEye.xyz);

	//compute specular light
	vec3 reflection = normalize(reflect(lightDirN, normalEye));
	float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
	
	//compute distance to light
	float dist = length(firePosEye - fPosEye.xyz);
	//compute attenuation
	float att = 1.0f / (constant + (linear+i1) * dist + (quadratic+i2) * (dist * dist));

	//compute ambient light
	vec3 ambientAuxFire = att * ambientStrength * fireLightColor * texture(diffuseTexture, fTexCoords).rgb;

	//compute diffuse light
	vec3 diffuseAuxFire = att * max(dot(normalEye, lightDirN), 0.0f) * fireLightColor * texture(diffuseTexture, fTexCoords).rgb;

	vec3 specularAuxFire = att * specularStrength * specCoeff * fireLightColor * texture(specularTexture, fTexCoords).rgb;

	ambient = ambient + ambientAuxFire;
	diffuse = diffuse + diffuseAuxFire;
	specular = specular + specularAuxFire;
}


void main() 
{
	computeLightComponents();
	
	vec3 baseColor = vec3(0.9f, 0.35f, 0.0f);//orange

	float shadow = 0.0f;
	float fogFactor = computeFog();
	vec4 fogColor;
	
	if(!night){
		fogColor = vec4(0.5f, 0.5f, 0.5f,1.0f);
		shadow = computeShadow();
	}else{
		computePointLight();
		computeFirePointLight();
		fogColor = vec4(0.5f, 0.5f, 0.5f,1.0f);
	}
	
	ambient *= texture(diffuseTexture, fTexCoords).rgb;
	diffuse *= texture(diffuseTexture, fTexCoords).rgb;
	specular *= texture(specularTexture, fTexCoords).rgb;
	

	//modulate with shadow
	vec3 color = min((ambient + (1.0f - shadow)*diffuse) + (1.0f - shadow)*specular, 1.0f);
    
	fColor = mix(fogColor, vec4(color,0.1), fogFactor);

}
