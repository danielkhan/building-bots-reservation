# Building bots with Node.js

This repository contains the code for my course 'Building Bots with Node.js' on [LinkedIn Learning](https://www.linkedin.com/learning/instructors/daniel-khan).

The master branch contains the initial version to get started with, while the branches contain the state of the code at the beginning (e.g. 02_02**b**) and end (e.g. 02_02**e**) of a video.

## Setting up the project

* In your terminal, create directory `building-bots-reservation` and **change into it**.
* Run 
  ```bash
  git clone --bare git@github.com:danielkhan/building-bots-reservation.git .git
  git config --bool core.bare false
  git reset --hard
  git branch
  ```
* With a branch you want to use checked out, run `npm install` and `npm run dev`
* This will run the application via nodemon and it will listen on `http://localhost:3000`