# Project Idea: Fleet Management System

## Theme
- **Fleet Management System**: The project proposes a solution for companies operating fleets dispersed across multiple locations. Consider a construction company with various worksites in different places. Not all vehicles return to headquarters daily, making fleet monitoring challenging. The concept involves a specific vehicle, which commutes daily between headquarters and one of the worksites, collecting data from vehicles and equipment at other worksites en route. Upon reaching headquarters, this vehicle reports all gathered data. This enables administrators to access critical information about the entire fleet, such as fuel levels and distance traveled, even for vehicles not returning daily. Communication between vehicles and headquarters would utilize ad-hoc communication protocols like IPFS with ITS-GX.
![RSA-Schema](https://github.com/CatarinaBarroqueiro/rsa_proj/assets/95221731/91033f00-d7b4-4480-be54-f52a614d84fd)

## Goals
- **Decentralization**:
  - Eliminate the need for constant internet connection.
  - Shift away from centralized data management systems.

- **Data Accessibility**:
  - Provide users with relevant information on-demand.
  - Focus on end-of-day, weekly, or monthly insights rather than real-time tracking.

- **Enhanced Metrics**:
  - Monitor driving habits (acceleration, braking ratings, etc.).
  - Track fuel consumption and anomalies (e.g., break-ins).
  - Monitor vehicle trajectory and deviations from assigned paths.
  - Capture additional metrics like driver attention and breaks.

- **Efficient Communication**:
  - Facilitate communication between vehicles within the fleet.
  - Utilize LORAWan for transmitting small data packets, mainly location information.
  - Implement ITS-G5 or similar ad-hoc protocols for inter-vehicle communication and data offloading based on routes.
  - Prioritize data offloading between vehicles based on return time to headquarters or company sites.

## Additional Topics
- **Security Measures**:
  - Implement robust encryption techniques to secure data transmission.
  - Authenticate device connections using challenge-based authentication.
  - Utilize public-private key pairs with certificates signed by the company to prevent man-in-the-middle attacks and ensure authentic connections.
