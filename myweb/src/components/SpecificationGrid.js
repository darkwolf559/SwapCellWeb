import React, { useState } from 'react';
import { Cpu, HardDrive, Camera, Battery, Monitor, Smartphone, Sparkles, Zap } from 'lucide-react';

const SpecificationGrid = ({ specs }) => {
  const [hoveredSpec, setHoveredSpec] = useState(null);

  const specItems = [
    {
      icon: Cpu,
      label: 'Processor',
      value: specs.processor,
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      bgGradient: 'from-purple-50 to-pink-50',
      glowColor: 'shadow-purple-500/20'
    },
    {
      icon: HardDrive,
      label: 'RAM/Storage',
      value: `${specs.ram} / ${specs.storage}`,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      glowColor: 'shadow-blue-500/20'
    },
    {
      icon: Camera,
      label: 'Camera',
      value: specs.camera,
      gradient: 'from-green-500 via-emerald-500 to-lime-500',
      bgGradient: 'from-green-50 to-emerald-50',
      glowColor: 'shadow-green-500/20'
    },
    {
      icon: Battery,
      label: 'Battery',
      value: specs.battery,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      bgGradient: 'from-yellow-50 to-orange-50',
      glowColor: 'shadow-yellow-500/20'
    },
    {
      icon: Monitor,
      label: 'Display',
      value: specs.screen,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      bgGradient: 'from-indigo-50 to-purple-50',
      glowColor: 'shadow-indigo-500/20'
    },
    {
      icon: Smartphone,
      label: 'OS',
      value: specs.os || 'Not specified',
      gradient: 'from-gray-500 via-slate-500 to-zinc-500',
      bgGradient: 'from-gray-50 to-slate-50',
      glowColor: 'shadow-gray-500/20'
    }
  ];

  return (
    <div className="relative group">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-2xl blur-xl animate-pulse"></div>

      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center mb-8">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-4 animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Technical Specifications
          </h3>
        </div>

        {/* Grid of specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specItems.map((item, index) => (
            <div
              key={item.label}
              className={`relative group cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                hoveredSpec === index ? 'z-10' : 'z-0'
              }`}
              onMouseEnter={() => setHoveredSpec(index)}
              onMouseLeave={() => setHoveredSpec(null)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glowing background effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-20 rounded-xl blur transition-all duration-500 transform scale-110`}></div>

              {/* Main card */}
              <div className={`relative bg-gradient-to-br ${item.bgGradient} p-6 rounded-xl border border-white/40 shadow-lg ${item.glowColor} transition-all duration-500 backdrop-blur-sm`}>
                {/* Animated icon */}
                <div className={`relative w-14 h-14 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-500`}>
                  <item.icon className="h-7 w-7 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 border-2 border-white/20 rounded-xl animate-spin group-hover:animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">{item.label}</div>
                  <div className="font-bold text-lg text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                    {item.value}
                  </div>
                </div>
                {hoveredSpec === index && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-10 pt-8 border-t border-gray-200/50">
          <h4 className="font-bold text-xl mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500 animate-bounce" />
            Premium Features
          </h4>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Face ID', color: 'from-blue-400 to-purple-400' },
              { name: 'Wireless Charging', color: 'from-green-400 to-blue-400' },
              { name: 'Water Resistant', color: 'from-cyan-400 to-teal-400' },
              { name: '5G Ready', color: 'from-purple-400 to-pink-400' },
              { name: 'Night Mode', color: 'from-indigo-400 to-purple-400' },
              { name: 'Fast Charging', color: 'from-yellow-400 to-red-400' }
            ].map((feature, index) => (
              <div key={feature.name} className="group relative overflow-hidden" style={{ animationDelay: `${index * 150}ms` }}>
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300`}></div>
                <span className={`relative bg-gradient-to-r ${feature.color} text-white px-4 py-2 rounded-full text-sm font-medium hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl inline-block`}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationGrid;
