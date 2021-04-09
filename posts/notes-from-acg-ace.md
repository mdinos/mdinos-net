---
title: 'All of my notes from the “A Cloud Guru” Associate Cloud Engineer course.'
date: '2021-04-09'
---

I’ve decided to write up all of my notes, in a conversational, hopefully readable way on a single-page document. I hope others might find this useful — I cannot, however, claim that everything in this post will be wholly accurate, I’ve included some of my own insight into the ramifications of certain things said on the course, perhaps making assumptions in the process, hopefully these will be useful, and if they’re wrong, please let me know! Please post an issue in the [GitHub repository](https://github.com/mdinos/mdinos-net) where this post is sourced.

## Why would you choose Google Cloud?
Google has a focus on Big Data. Their mission statement is to organise the worlds information, and make it accessible, and useful.

Google focuses on innovation, turning internal tools that Googlers have created over the years and selling them as services. These are often things that very few organisations would be able to create on their own.

#### Google’s organisation & the history of GCP
Google hires SREs, not Ops people. Google puts the developer first, while AWS tends to puts the Ops first. 

You can see this in a tool like Firebase. The application, or the developer, comes first - the code you write is the important thing, and Google focus on abstracting away the misery of infrastructure, or basically, the stuff that can be more generic to a thousand use-cases. 

#### Google is playing catch-up to AWS
This means that some functionality can be just missing in GCP. It does however have the positive that they’ve avoided some of the pitfalls that AWS has fallen into, and reduced the amount of technical debt.

They are more positioned to be used for a particular purpose than AWS. AWS has /a/ service for everything, even if it might not be the best. Google focuses on its Big Data tooling. With Anthos and similar, we can extrapolate that Google is happy to be ‘a cloud’ you use, rather than ‘the cloud’.

## How is GCP structured and designed?
GCP has a few key focuses and concerns over which the platform as a whole is built. This section will go over them.

#### GCP is a global system
The GCP suite is designed to meet worldwide customers. This is contrary to what AWS offers - they provide more region-scoped services. 

#### Many data-centres make a zone
These are independently running data centres, with independent supplies (such as power) with backup generators and security and suchlike. 

#### Groups of zones make a region
These are very fast links between each data centre in a zone, between each zone. 

#### Google provides multi-regional services
These services, for example Cloud Storage, run across multiple regions, through a massive private global network where Google have buried fibre across the world to connect up their data centres. 

#### Edge locations are Points of Presence for content delivery
Various services can be configured to discharge data to customers at these points of presence, as a content-delivery-network. These allow customers to experience minimal wait time when waiting for services. 

#### Network ingress and egress, and Google’s private network
Normal networks accept data from the public internet. These route traffic via the internet, to an edge location that is closest to the destination. What this means is if a user was trying to access something in a data centre, the data would travel through the general internet infrastructure to a point as close to the data centre as possible. 

Google does something a little different. They route all traffic possible through their own private network, meaning that a user could be closer to one of Google’s PoPs, so the data would traverse the internet only as far as Google’s PoP, before traveling the rest of the way to the server via Google’s own private infrastructure. 

This can be turned off, to reduce cost, and also reduce the functionality!

#### There are a few different pricing models
Provisioned infrastructure normally has a fixed price, for example a virtual machine is provisioned and can handle a certain amount of compute workload before it can’t do anymore. This instance would have a fixed cost no matter how you were using it. It is /provisioned/.

Usage-based infrastructure is the more ‘pay-as-you-go’ model, for example Cloud Functions can run one or ten-thousand times with the same configuration, but you only pay for what is used.

Network traffic is charged in GCP.  In general, ingress is free, and egress is charged (usually in GB), unless you’re forwarding data to another GCP service, in which case, they’ll get you in the end!

#### Security is a primary concern
While you can deal with your own encryption, particularly using KMS (key management service), it is mostly managed for you. Encryption is nearly universal in GCP. All GCP service control information, all WAN traffic, all data at rest, and they are working towards encrypting local traffic within data centres. But it’s still best to distrust the network despite all of these precautions.

#### Automation and scaling is key
Every service is designed to scale infinitely from the customer perspective, however of course there are resource quotas. These can be changed on request to GCP support, and can be seen by using this gcloud command:
```shell
gcloud compute project-info describe --project ${projectId}
```

#### Projects live within organisations
Projects and folders live within organisations, which are responsible for the billing. This makes some aspects of managing a project significantly easier, and getting started with a new project much simpler. These projects have no cost associated with them, so projects can be used for very small tasks, but this can ensure services do not clash with each other and infrastructure can be very idempotent, with clarity on what is being used in this project because of the small number of things that are present in it. 

---
# The Content Proper
This is where the main section of the course begins. Each section will usually go through a service, or setting up something particular to achieve a specific goal.

## Setting up Billing, exporting data to BigQuery
Managing cost is a big thing in corporate machines. Being accountable for your departments costs, tracking costs, managing costs and mitigating against unnecessary cost is a large part of being an organisation administrator. Billing export to BigQuery enables you to export your daily usage automatically, to a BigQuery dataset which is specified by you. The data can then be queried, just like any other BigQuery dataset. This allows you to use any tool you like to analyse your billing data. (Something like, CloudAbility).

#### Exports should be set up on a per-billing-account basis
You can have multiple billing accounts. They are distinct from projects, and can encompass multiple projects.

#### Billing export is not real-time
Usually, the delay is measured in hours, so it’s not that useful for taking actions based on the information in the BQ dataset.

#### Billing alerts are specific to a billing account, and can be refined to alert based on particular projects within the billing account
You can therefore set up multiple budget alerts for a particular billing account. 

#### The billing account user role provides the required permissions to link projects to a billing account
This role is very limited in scope, and usually is given with project creator -- allows the user in question to create and link new projects to a responsible billing account. This means you can give this permission within your organisation to a person, who can charge resources in their projects to your credit card.

#### A project can be made by a billing-account-user, and the creator is not required to give permissions to view that project to the owner of the billing account
This means ‘ghost projects’ can be attached to your billing account if you are not careful with who gets this permission!

## The Cloud Shell
This is the terminal interface available from the web-browser. It’s great for ensuring you have up-to-date SDKs, and are fully authenticated when you run gcloud commands. This is glorious for people on Windows machines, and ChromeBooks, or those who just can’t be arsed with setting up SSH key management.

#### Plenty of handy programs are pre-installed on the cloud shell
`gcloud bq kubectl npm node python pip ruby vim emacs bash` and more, all ship with cloud shell

#### You get 5GB of persistent storage on your cloud shell instance
I would assume this means you can install your own programs. Everything in the `home` directory is persisted.

#### You can use the special `dl` command to download files from the shell to your computer
i.e. `dl myfiles.txt`

#### You can run programs (like node apps) and use “web preview” to view locally running applications
This functionality proxies your localhost through an app engine instance, and is authenticated to your google account. 

#### You can run the a virtual VSCode instance to edit code from the cloud shell
You can get live updates for node apps by using the `nodemon` tool, to reload changes automagically.

#### I can’t believe how awesome it is
The only thing missing is extensions. I’m sure they have it in the works, but with a little more performance and persistent configuration (maybe a docker container image setup), they could make hardware resources for developers all but redundant. It has full git integration, and you can load your SSH keys onto it, there’s nothing stopping you from making your whole workflow around your GCP account and Cloud Shell.

## Data Flows
These are obviously central to GCP, as they are in every aspect of IT. Passing data from place to place is the name of the game, processing data, identifying useful patterns from that data and presenting data is the whole point in most websites.

At this point in the course there was a very strained metaphor about taking kids home from a ballet recital, I think the point was step-by-step processes, achieving a task by breaking down the steps are equivalent to data flows in a system. Each step in the system requires you to think about the tool being used, and how that will interact with the next step in the chain. Requirements and options are not always clear, but thinking strongly about the data flow will help you avoid potential issues down the line.

## Cloud Storage
This section will talk about usage, limitations, and tips and tricks with the Cloud Storage service

#### Cloud Storage stores data in buckets
These buckets must have globally-unique names. Nobody can have the same bucket name as you - so if you’re creating buckets automatically, you’ll have to ensure the names are sufficiently random such that you won’t collide with someone else’s bucket.

#### The first concern is the location
There are trade-offs to be made here. You can pick a single region for the lowest latency to your application, dual region for high availability and /almost/ as low latency, or finally you can choose a multi-region — this provides the highest availability, at the cost of latency. Dual regions are new, so have limited availability, for example right now as of writing, the only place in Europe to offer this is across the Netherlands and Finland. So bear in mind data sovereignty requirements when you’re choosing a bucket.