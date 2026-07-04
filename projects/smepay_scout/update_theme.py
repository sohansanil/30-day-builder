import re

with open("frontend/app/page.tsx", "r") as f:
    content = f.read()

# Imports
if "next/image" not in content:
    content = content.replace('import { useState } from "react";', 'import { useState } from "react";\nimport Image from "next/image";')

# Idle
content = content.replace('bg-brand-teal/20', 'bg-brand-vibrant/10')
content = content.replace('border-brand-teal/30', 'border-brand-vibrant/30')
content = content.replace('text-brand-teal-light text-sm', 'text-brand-forest text-sm')
content = content.replace('bg-brand-teal hover:bg-brand-teal-light text-white', 'bg-brand-forest hover:bg-brand-forest/90 text-white')
content = content.replace('rgba(20,184,166,0.3)', 'rgba(10,60,43,0.3)')
content = content.replace('rgba(20,184,166,0.5)', 'rgba(10,60,43,0.5)')
content = content.replace('<h1 className="text-5xl md:text-7xl font-bold tracking-tight">', '<div className="flex justify-center mb-8"><Image src="/smepayLogo.webp" alt="SMEPay Logo" width={200} height={60} className="object-contain" /></div>\n          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-brand-forest">')

# Loading
content = content.replace('from-brand-teal-light to-blue-500', 'from-brand-forest to-brand-vibrant')
content = content.replace('text-brand-teal-light animate-spin-slow', 'text-brand-forest animate-spin-slow')

# Main bg
content = content.replace('bg-brand-navy', 'bg-brand-cream')

# Header
content = content.replace('border-slate-800', 'border-slate-200')
content = content.replace('<h1 className="text-3xl font-bold flex items-center gap-3">\n              <Radar className="text-brand-teal-light" />\n              SMEPay <span className="gradient-text">Scout</span>\n            </h1>', '<div className="flex items-center gap-3 mb-2">\n              <Image src="/smepayLogo.webp" alt="SMEPay Logo" width={120} height={40} className="object-contain" />\n              <span className="text-3xl font-bold gradient-text">Scout</span>\n            </div>')
content = content.replace('text-slate-400', 'text-slate-500')
content = content.replace('bg-brand-amber/5', 'bg-brand-amber/10')

# Verdict
content = content.replace('border-brand-teal-light/50', 'border-brand-vibrant/50')
content = content.replace('from-brand-surface/80 to-brand-teal-light/10', 'from-brand-surface to-brand-vibrant/10')
content = content.replace('bg-brand-teal-light', 'bg-brand-vibrant')
content = content.replace('text-brand-teal-light', 'text-brand-vibrant')
content = content.replace('divide-slate-700/50', 'divide-slate-200')
content = content.replace('text-white truncate', 'text-brand-forest truncate')

# Briefing
content = content.replace('text-white', 'text-brand-forest')
content = content.replace('text-slate-300', 'text-slate-700')

# Pain Points
content = content.replace('bg-brand-surface rounded-full', 'bg-brand-red/10 rounded-full')
content = content.replace('text-slate-600', 'text-slate-600') # handled below

# Win Zones
content = content.replace('border-l-brand-teal-light', 'border-l-brand-vibrant')

# Opportunity Engine
content = content.replace('to-brand-navy', 'to-brand-surface-alt')
content = content.replace('bg-brand-teal-light/10', 'bg-brand-vibrant/10')
content = content.replace('border-brand-teal-light/20', 'border-brand-vibrant/20')
content = content.replace('bg-brand-teal-light/20', 'bg-brand-vibrant/20')
content = content.replace('bg-brand-navy/50', 'bg-white')
content = content.replace('mt-6">', 'mt-6 border border-slate-100 shadow-sm">')

# Final global replacements
content = content.replace('text-slate-400', 'text-slate-600')
content = content.replace('text-white', 'text-brand-forest')
# Some were text-brand-forest truncate, let's fix
content = content.replace('text-brand-forest truncate', 'text-brand-forest truncate')

with open("frontend/app/page.tsx", "w") as f:
    f.write(content)

