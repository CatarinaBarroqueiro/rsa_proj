# Project Idea: Fleet Management System

## Authors

* Gonçalo Silva, 103244
* Catarina Barroqueiro, 10389

## Description

The project proposes a solution for companies operating fleets of moving vehicles fleets with different routes. Consider the example of a construction company with various worksites in different places or a transportation company with multiple vehicles on overlapping routes. Not all vehicles return to headquarters daily, making fleet monitoring challenging. This problems could be mitigated by using data or cell signal to exchange the information. However, this approach requires constant internet access and subscriptions for network access, as well as servers to process and store the data. Our **concept** is based on ad-hoc communication between the company vehicles, where data is shared between vehicles. When a vehicle reaches the headquarters it reports all his and others gathered data. This enables administrators to access critical information about the entire fleet, such as route made, time that the vehicle spent stationary, consumed fuel, available fuel..., even for vehicles not returning daily. Communication between vehicles and headquarters could also be based in the same communication technology.

Most Fleet Management systems log all vehicle data on the cloud, requiring constant internet connection, leading to subscription fees from both the internet service provider and the company that provided the device. This raises immediate security concerns, since the data is never in the possession of the client and always in the company that provided the service, making it more difficult for him to change suppliers. Adding to it that most systems are overkill for what most companies want, which is just a logging system, where they can quickly access and get information about the vehicle, but not necessarily in real-time, saving them membership costs. To provide such a service, our system is based in ad-hoc V2X communication technologies between the company vehicles, allowing them to offload data between each other. Making it so that when a vehicle reaches the headquarters it reports not only it's information, but also what he has gathered from others. This enables administrators to access information about the entire fleet, even for vehicles not returning daily.

# Setup

Make sure you have Docker, Python and Angular installed in your system

## Execution

Navigate to the `fleeta-backend` folder and start the backend server using docker:

```bash
cd fleeta-backend
docker compose up -d
```

Next, navigate to the `fleetaDash` folder and initiate the frontend Angular website:

```bash
cd fleetaDash
ng serve
```

Lastly, navigate to the `project` folder and follow the guide present there.


