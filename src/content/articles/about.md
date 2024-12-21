---
title: About piucenter
description: 
date: 2024-12-19
---
# about piucenter

piucenter is founded on the idea that community-made .ssc stepchart files are a rich resource for data analysis, visualization, and creating tools for the community to support players playing on official Pump it Up machines.

piucenter is a hobby project by aesthete. Join our [discord](https://discord.gg/aHbZsk7j2U).

- [github: solidjs front-end web app](https://github.com/maxwshen/piu-vis-ss)
- [github: python stepchart processing](https://github.com/maxwshen/piu-annotate)

The first version of piucenter launched in August 2021. A major update ("2.0") overhauling the web app was launched around December 2024.

---

### How does piucenter work?

- Input simfiles: https://github.com/rayden-61/PIU-Simfiles

piucenter operates on top of .ssc simfiles built by the community. These files contain the timestamps of all arrows and holds in each stepchart, which is the starting information used for everything presented in piucenter.

Importantly, community-built .ssc simfiles can be incorrect or outdated compared to official PIU content, which presents a major obstacle in piucenter's goal of being as accurate to official PIU content as possible. If you are interested in helping improve simfile accuracy, it could help improve piucenter content, and you would earn my gratitude.

The next step is annotating foot usage (left foot or right foot) using timestamps of arrows and holds. Previously, Dijkstra's algorithm was used for this, but it was difficult to adjust prediction behavior. The current approach uses a combination of 1) hand-designed pattern reasoning rules, which cover common, easy cases like runs where you alternate feet; and hold + tap doublestepping, where one foot holds the hold, and the other foot is repeatedly used to hit other notes; and 2) machine learning prediction, which handles ambiguous or complex patterns where simple hand-designed algorithms are difficult or unreasonable to write down. For example, identifying staggered brackets requires timing information, and contextual pattern information; the same is true for distinguishing between brackets and jumps. The ML models were iteratively improved using a flywheel, where I started by manually annotating handful of stepcharts, used that to train gradient-boosted classifiers (LightGBM), then looked at predicted foot annotations and manually corrected some, which increased the training set; as this process is repeated, the models improved, making further manual correction easier. 

With arrow and hold timestamps, and foot annotations for all notes, further annotations are performed, such as labeling skills like twist angles, jacks, footswitches, doublesteps. Segmentation and difficulty prediction are also performed here.
