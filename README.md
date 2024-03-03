# POWER MANAGEMENT IN DC MICROGRID

## Introduction

The demand for electricity is continuously increasing due to population growth and the proliferation of household appliances. Simultaneously, there's a transition in energy markets towards incorporating renewable energy sources, offering potential improvements in reliability and flexibility. This project aims to implement a system for producing and managing power for domestic applications, focusing on decoupling CO2 emissions and addressing the fossil fuel crisis by leveraging microgrid-based systems.

## Objectives

The objectives of this project include:

- **Collecting current and voltage sensor values** using ADC from sensors connected to Raspberry Pi.
- **Sending these values to the Node Server, calculating the power generated,** and inserting the values into a MongoDB database.
- **Controlling the Raspberry Pi GPIO pins** from a Web App using a NodeJS Server deployed on PC and a Client server deployed on Raspberry Pi.
- **Creating a web app displaying power generation, consumption,** and providing features for users to control appliances and buy/sell remaining power.
- **Designing and implementing suitable DC-DC converters and inverters** for solar PV-based domestic applications.

## Technologies Used

- **Python IDE:** For Raspberry Pi programming
- **Visual Studio Code:** Editor for writing web app code
- **HTML/CSS/JavaScript:** For building the front end of the web app
- **NodeJS:** JavaScript runtime environment used for backend
- **ExpressJS:** Framework for NodeJS used for backend
- **MongoDB:** Database for storing sensor data
- **Socket.io:** JavaScript library for communication between Node.js and Raspberry Pi

## Installation and Setup

### Prerequisites

- Raspberry Pi with sensors
- Node.js installed on both PC and Raspberry Pi
- MongoDB installed on PC
- Python IDE installed on Raspberry Pi
- Visual Studio Code installed on PC

### Steps

1. Clone the repository: `git clone https://github.com/rolanorebelo/power-management-app.git`
2. Set up Raspberry Pi with sensors and ensure Node.js is installed.
3. Install MongoDB on your PC and ensure Node.js is installed.
4. Set up Python IDE on Raspberry Pi for programming.
5. Set up Visual Studio Code on your PC for editing web app code.
6. Navigate to the project directory and install dependencies: `npm install`
7. Start the NodeJS server on your PC: `node server.js`
8. Deploy the Client server on Raspberry Pi and ensure it connects to the Node server.
9. Access the web app in a browser and start managing power efficiently.

## Contribution

Contributions are welcome! Please follow the guidelines outlined in CONTRIBUTING.md.

## License

This project is licensed under the [MIT License](LICENSE).
