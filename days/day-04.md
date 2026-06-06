# Day 4 — Deploy to the Internet

**Date**: June 8, 2026  
**Focus**: CI/CD (Continuous Integration / Continuous Deployment), GitHub Actions, GitHub Pages, root directory structure, and static serverless hosting.  
**Type**: 🧠 Learning + 🔨 Building

---

## 🎯 Learning Objective

Understand the mechanics of web deployment, how local files are translated into cloud-hosted assets, how domain routing works in static sites, and how to configure an automated CI/CD pipeline using GitHub Actions to deploy revisions live to GitHub Pages on every git push.

---

## 🧠 What I Learned

### Localhost vs. Public Servers
- **Localhost**: Runs on the local loopback interface (`127.0.0.1`), accessible only to the local machine.
- **Production Servers**: Computers connected to the public internet with dedicated DNS configurations. In modern static hosting, files are copied to CDN (Content Delivery Network) nodes globally, guaranteeing sub-100ms response times anywhere in the world.

### How GitHub Pages Deployment Works
1. **GitHub Actions Workflow**: Every time code is pushed, a runner virtual machine is spun up in the cloud.
2. **Checkout & Configuration**: The virtual machine pulls the source branch files.
3. **Artifact Upload**: The files (including HTML, CSS, assets, and folders) are packaged into a `.tar` archive.
4. **API Call**: The archive is sent to GitHub's hosting engine, decompressed, and linked to your domain (`sohansanil.github.io/30-day-builder/`).

### Directory Routing in GitHub Pages
- GitHub Pages roots your website to the root directory (`.`).
- Therefore, the file `index.html` at the root becomes the primary landing page: `https://username.github.io/reponame/`.
- All subfolders are automatically routed relative to that root:
  - Portfolio page: `/projects/portfolio/index.html`
  - JavaScript logic: `/projects/portfolio/script.js`
  - Daily log: `/days/day-01.md`

---

## ✅ What I Did

- [x] Designed and created the **30-Day Journey Hub** (`index.html` at the root):
  - Created a landing dashboard to introduce the 30-day challenge.
  - Added statistics counters tracking completed days and active builds.
  - Implemented a 30-day visual card calendar showing Completed, Active, and Planned milestones.
- [x] Developed the root stylesheet `style.css`:
  - Reused CSS variables and styles (OKLCH, Outfit/Inter typography, responsive grid configurations).
  - Integrated theme checks matching user settings or system preferences.
- [x] Configured the automated deployment workflow:
  - Created `.github/workflows/deploy.yml`.
  - Configured git branch push triggers, upload targets, and official Pages action dependencies.
- [x] Updated the master `README.md` roadmap to register Day 4 outcomes.

---

## 💡 Key Takeaways

1. **Deploying early reduces friction**: Publishing a project on Day 4 ensures all future daily revisions are deployed instantly, making testing on physical devices (like mobile phones) simple.
2. **CDNs are incredibly efficient**: Static sites hosted on CDNs have zero server overhead, scale to millions of concurrent users automatically, and cost nothing.
3. **Hub directories organize multi-project repos**: In a multi-week challenge, having a root landing page makes it easy for outside observers (recruiters/mentors) to navigate individual days' works.

---

## 🔗 Resources

- [GitHub Pages Official Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Quickstart Guide](https://docs.github.com/en/actions/quickstart)

---

## 📣 LinkedIn Post Draft

> **Day 4 of my 30-Day Builder Journey** 🚀
> 
> My builder portfolio and journey tracker are now LIVE on the public internet! 🌐
> 
> Today's focus was all about Continuous Integration & Continuous Deployment (CI/CD) and serverless static hosting. Instead of just hosting a single page, I built a central **30-Day Journey Hub** at the root of my repository to display my progress and roadmap.
> 
> Here's what I did today:
> 
> 🛠️ **Automated CI/CD**: Configured a GitHub Actions workflow (`deploy.yml`). Now, every time I commit and run `git push`, a GitHub runner spins up, packages my repository, and deploys the latest version live to GitHub Pages.
> 
> 🗂️ **Journey Hub Dashboard**: Created a visual 30-day calendar dashboard at the root of my repository. It displays my active stats, completed days, topics, and direct links to my interactive project pages.
> 
> 📱 **Responsive & Consistent Design**: Extended my CSS variables, light/dark themes, and card layouts to the root hub so the entire repository shares a cohesive look and feel.
> 
> Deploying on Day 4 means that every single project I build from now on will be instantly live for anyone to try out on any device!
> 
> Check out my live hub: https://sohansanil.github.io/30-day-builder/
> 
> Check out the repository: https://github.com/sohansanil/30-day-builder/
> 
> #BuildInPublic #CICD #GitHubActions #GitHubPages #WebDeployment #DataScience #WebDev #30DayBuilderJourney
