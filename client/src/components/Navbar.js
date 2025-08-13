import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const navLinks = [
	{ name: 'Home', href: '/' },
	{ name: 'Events', href: '/Events' },
	{ name: 'Live', href: '/watch' },
	{ name: 'Fighters', href: '' },
	{ name: 'News', href: '#' },
];

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<motion.nav
			initial={{ y: -80 }}
			animate={{ y: 0 }}
			transition={{ type: 'spring', stiffness: 120 }}
			className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-ufcBlack/90 shadow-lg' : 'bg-transparent'} backdrop-blur-lg`}
		>
			<div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
				<span className="font-headline text-3xl text-ufcRed tracking-wide">UFC Ethiopa</span>
				{/* Desktop nav */}
				<ul className="hidden md:flex space-x-8">
					{navLinks.map(link => (
						<li key={link.name}>
							<a
								href={link.href}
								className="text-white font-body text-lg hover:text-ufcRed transition-colors duration-200"
							>
								{link.name}
							</a>
						</li>
					))}
				</ul>
				{/* Hamburger icon for mobile */}
				<button
					className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Toggle menu"
				>
					<span className="block w-7 h-1 bg-ufcRed mb-1 rounded transition-all duration-300" style={{ transform: menuOpen ? 'rotate(45deg) translateY(8px)' : 'none' }}></span>
					<span className={`block w-7 h-1 bg-white mb-1 rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
					<span className="block w-7 h-1 bg-ufcRed rounded transition-all duration-300" style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none' }}></span>
				</button>
			</div>
			{/* Mobile menu */}
					<motion.div
						initial={false}
						animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
						className="md:hidden absolute top-full left-0 w-full bg-ufcBlack/95 px-6 py-6 z-50"
						style={{ pointerEvents: menuOpen ? 'auto' : 'none' }}
					>
						<ul className="flex flex-col space-y-4">
							{navLinks.map(link => (
								<li key={link.name}>
									<a
										href={link.href}
										className="text-white font-body text-lg hover:text-ufcRed transition-colors duration-200"
										onClick={() => setMenuOpen(false)}
									>
										{link.name}
									</a>
								</li>
							))}
						</ul>
					</motion.div>
		</motion.nav>
	);
}
