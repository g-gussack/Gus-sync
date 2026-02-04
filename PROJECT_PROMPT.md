# Application Project Prompt

## Project Name
SyncTrack

## Overview
This is an application that opens as a window on my Macbook. It is to keep track of topics that require follow up meetings or discussions

## Target Users
[Scrum Masters and Product Owners]

## Core Features
[List the main features and functionality you want]

1. Text input to add topics and assign a rank 
2. A place to input and ADO token to integrate tasks with work items
3. Two tabs, one for internal topics and one for external

## Technical Requirements
[Any specific technologies, frameworks, or constraints?]

- Platform: Desktop
- Language preferences: Suggest the best language for this application
- Database needs: 
- Other requirements: Integrate with ADO to link work items to tasks. I should be able to click a workitem link within a task and it opens the work item in ADO 

## User Flow
User opens the application, there are two tabs. One is marked internal and one is marked external. There is also a third tab marked "Hot". Items from both Internal and External tabs can be added here as these are the highest priortiy. 

User is able to input a brief text description of the topic that requires a sync of meeting. These can be selected to be internal or external. For Items marked "Internal" they must be additionally tagged as BBweb, BBAutomation, BB Analytics, or ALL. For Items marked as "External" these items need to be additionally marked or tagged Support, PS, Other Product, or Multiple

There is a third tab named "HOT" work items from either tab can be selected to be added to this tab is these are the most critical items for follow up. These are essentially very high priority work items. 

Each work item can be assigned a priority by number. 1 being highest priority and higher numbers are lowest. Each tab can only have one task associated with a number. So there can not be 2 items in "Internal" Marked as a "3". If there are 5 items they would be numbered 1-5, if there are 10 they would be 1-10 and presented in ascending order to the user. There should be a fire emoji button on the side of each item. Clicking this allows that item to be added to the "HOT" tab.

All items will fall in to either one of these two tabs and always be present until marked complete. Once they are marked as complete they should be removed from their respective tab and stored somewhere similar to an archive within the app. 

ADO linking- For every input item there is an optional integration with ADO. If there is a work item in ADO that is available it can be linked and will show as a hpyerlink in the title of the item. 

## Success Criteria
A smoothe well functioning app that is simple and easy to use.

## Additional Notes
I want the UI to be similar to the Liquid Glass feature on MacOS. The text will be white but the background and framework of the app are opaque but still clear. I am able to provide a screenshot as reference. 
