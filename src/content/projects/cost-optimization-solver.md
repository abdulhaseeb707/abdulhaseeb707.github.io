---
title: Operational Cost Optimization Model
summary: I built a linear programming model in Excel Solver to find the lowest-cost production plan under output and resource limits.
period: February – May 2025
status: completed
draft: true # publish once the Excel model or screenshots are in public/files/
order: 2
chapter: solver
question: What is the cheapest way to meet a production target when materials, labour and capacity are limited?
methods:
  - Linear programming
  - Sensitivity analysis
tools:
  - Microsoft Excel (Solver)
links: []
---

## The problem

A firm has to produce a required amount of output, but each input it uses has a cost and a limit. The question
is which mix of inputs meets the target for the least money.

## What I did

I wrote the problem as a linear programme: decision variables for how much of each input to use, an objective
function for total cost, and constraints for output and resources. I solved it with Excel Solver and read the
optimal plan back as an operating decision.

<!-- Add: the model file, a screenshot of the Solver setup, the optimal solution and what it means. -->
