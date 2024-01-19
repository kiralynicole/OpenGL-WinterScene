#include "Camera.hpp"


namespace gps {

    //Camera constructor
    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
        //TODO
        this->cameraPosition = cameraPosition;
        this->cameraTarget = cameraTarget;
        this->cameraUpDirection = cameraUp;
        this->cameraFrontDirection = glm::normalize(cameraTarget - cameraPosition);
        this->cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, cameraUp));
        
    }

    //return the view matrix, using the glm::lookAt() function
    glm::mat4 Camera::getViewMatrix() {
        //TODO
        return glm::lookAt(cameraPosition, cameraTarget, this->cameraUpDirection);
    }

    //update the camera internal parameters following a camera move event
    void Camera::move(MOVE_DIRECTION direction, float speed) {
        //TODO
        switch (direction) {
        case MOVE_FORWARD:
            cameraPosition = cameraPosition + speed * cameraFrontDirection;
            break;
        case MOVE_BACKWARD:
            cameraPosition = cameraPosition - speed * cameraFrontDirection;
            break;
        case MOVE_LEFT:
            cameraPosition = cameraPosition - speed * cameraRightDirection;
            break;
        case MOVE_RIGHT:
            cameraPosition = cameraPosition + speed * cameraRightDirection;
            break;

        }
        cameraTarget = cameraPosition + cameraFrontDirection;

    }

    //update the camera internal parameters following a camera rotate event
    //yaw - camera rotation around the y axis
    //pitch - camera rotation around the x axis
    void Camera::rotate(float pitch, float yaw) {
        //TODO
       
        glm::vec3 direction;
        direction.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        direction.y = sin(glm::radians(pitch));
        direction.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));


        cameraFrontDirection = glm::normalize(glm::vec3(direction));
        cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, cameraUpDirection));
        cameraTarget = cameraPosition + cameraFrontDirection;
        
    }
    glm::vec3 Camera::getCameraPosition() {
        return this->cameraPosition;
    }
    void Camera::setCameraPosition(glm::vec3 cameraPosition) {
        this->cameraPosition = cameraPosition;
    }

}
