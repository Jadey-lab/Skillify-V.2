import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { motion } from "framer-motion";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import "../firebase";
import UserRank from "./UserRank";
import Leaderboard from "./Leaderboard";

const db = getFirestore();

const levelThresholds = [
  { level: "Beginner Scholar", xpRange: [0, 1000] },
  { level: "Junior Researcher", xpRange: [1001, 2000] },
  { level: "Academic Explorer", xpRange: [2001, 3500] },
  { level: "Scientific Analyst", xpRange: [3501, 5000] },
  { level: "Theorist", xpRange: [5001, 7000] },
  { level: "Senior Scientist", xpRange: [7001, 9000] },
  { level: "Principal Investigator", xpRange: [9001, 12000] },
  { level: "Distinguished Scholar", xpRange: [12001, 15000] },
  { level: "Elite Thinker", xpRange: [15001, 20000] },
  { level: "Nobel Mind", xpRange: [20001, Infinity] }, // Endgame prestige level
];

const getUserLevel = (xp) => {
  for (let level of levelThresholds) {
    const [min, max] = level.xpRange;
    if (xp >= min && xp <= max) {
      return level.level;
    }
  }
  return "Beginner Scholar"; // Fallback if no match
};


const questionsByDifficulty = {
  easy: [
    {
      question: "What is the chemical symbol for water?",
      options: ["H2O", "O2", "CO2", "NaCl"],
      correct: "H2O",
      clue: "It's the molecule that makes up most of the Earth's surface.",
    },
    {
    question: "Which planet is known as the 'Red Planet'?",
    options: ["Earth", "Mars", "Venus", "Jupiter"],
    correct: "Mars",
    clue: "Mars is known for its reddish appearance due to iron oxide on its surface.",
  },
  {
    question: "What is the boiling point of water at standard atmospheric pressure?",
    options: ["100°C", "90°C", "110°C", "120°C"],
    correct: "100°C",
    clue: "Water boils at 100°C under standard conditions.",
  },
  {
    question: "What is the chemical symbol for Gold?",
    options: ["Au", "Ag", "Pb", "Fe"],
    correct: "Au",
    clue: "The symbol for gold is derived from its Latin name 'Aurum'.",
  },
  {
    question: "Which gas do plants absorb for photosynthesis?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    correct: "Carbon dioxide",
    clue: "Plants absorb carbon dioxide during photosynthesis.",
  },
  {
    question: "Which type of white blood cell produces antibodies?",
    options: ["B cells", "T cells", "Macrophages", "Neutrophils"],
    correct: "B cells",
    clue: "B cells produce antibodies to fight infections."
},
{
    question: "Which organ is responsible for detoxifying the blood?",
    options: ["Liver", "Kidney", "Heart", "Lungs"],
    correct: "Liver",
    clue: "The liver helps remove toxins from the blood."
},
{
    question: "Which neurotransmitter is responsible for muscle contraction?",
    options: ["Serotonin", "Dopamine", "Acetylcholine", "Glutamate"],
    correct: "Acetylcholine",
    clue: "Acetylcholine plays a key role in muscle movement."
},
{
    question: "What is the atomic mass of Oxygen?",
    options: ["14", "16", "18", "20"],
    correct: "16",
    clue: "Oxygen has an atomic mass of 16."
},
{
    question: "What is the process by which plants make their own food?",
    options: ["Respiration", "Fermentation", "Photosynthesis", "Digestion"],
    correct: "Photosynthesis",
    clue: "Plants use sunlight to make food through photosynthesis."
},
{
    question: "What macromolecule serves as the genetic material in most living organisms?",
    options: ["Protein", "Carbohydrates", "DNA", "Lipids"],
    correct: "DNA",
    clue: "DNA contains genetic instructions in living organisms."
},
{
    question: "What is the speed of light in vacuum?",
    options: ["3.0×10^8 m/s", "1.5×10^8 m/s", "9.81 m/s²", "6.67×10^-11 Nm²/kg²"],
    correct: "3.0×10^8 m/s",
    clue: "Light travels at approximately 300 million meters per second in a vacuum."
},
{
  question: "What is the atomic number of Carbon?",
  options: ["6", "12", "14", "16"],
  correct: "6",
  clue: "Chemistry question on elements."
},
{
  question: "Who developed the theory of general relativity?",
  options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Niels Bohr"],
  correct: "Albert Einstein",
  clue: "Physics question on theories."
},
{
  question: "What is the process by which plants make their own food?",
  options: ["Photosynthesis", "Respiration", "Digestion", "Fermentation"],
  correct: "Photosynthesis",
  clue: "Biology/Plant Science."
},
{
  question: "Which planet is known as the Red Planet?",
  options: ["Mars", "Jupiter", "Saturn", "Venus"],
  correct: "Mars",
  clue: "Astronomy question on planets."
},
{
  question: "What is the most abundant gas in Earth's atmosphere?",
  options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
  correct: "Nitrogen",
  clue: "Earth science question on atmospheric composition."
},
{
  question: "What is the smallest unit of matter?",
  options: ["Molecule", "Atom", "Electron", "Cell"],
  correct: "Atom",
  clue: "Basic science question on matter."
},
{
  question: "Which organelle is responsible for photosynthesis in plants?",
  options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
  correct: "Chloroplast",
  clue: "Biology question on plant cells."
},
{
  question: "What is the main gas responsible for the greenhouse effect?",
  options: ["Oxygen", "Carbon Dioxide", "Hydrogen", "Helium"],
  correct: "Carbon Dioxide",
  clue: "Environmental science question."
},
{
  question: "What is the pH value of pure water?",
  options: ["5", "6", "7", "8"],
  correct: "7",
  clue: "Chemistry question on acidity."
},
{
  question: "Which particle has a negative charge?",
  options: ["Proton", "Neutron", "Electron", "Positron"],
  correct: "Electron",
  clue: "Physics question on atomic structure."
},
{
  question: "What is the heaviest naturally occurring element?",
  options: ["Uranium", "Plutonium", "Lead", "Gold"],
  correct: "Uranium",
  clue: "Chemistry question on elements."
},
{
  question: "Which law explains the relationship between pressure and volume of a gas?",
  options: ["Boyle's Law", "Charles's Law", "Newton's Law", "Hooke's Law"],
  correct: "Boyle's Law",
  clue: "Physics question on gas laws."
},
 {
    question: "What is the term for an organism's observable traits?",
    options: ["Genotype", "Phenotype", "Niche", "Species"],
    correct: "Phenotype",
    clue: "These traits are what you actually see, influenced by genes and environment."
  },
  {
    question: "What planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correct: "Mars",
    clue: "Its rusty surface color is a giveaway in the night sky."
  },
  {
    question: "What gas do plants absorb from the atmosphere for photosynthesis?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correct: "Carbon Dioxide",
    clue: "This gas is released by animals but used by plants to make food."
  },
  {
    question: "What is H2O commonly known as?",
    options: ["Salt", "Water", "Oxygen", "Hydrogen"],
    correct: "Water",
    clue: "A compound essential to life, often called the universal solvent."
  },
  {
    question: "What force pulls objects toward the center of the Earth?",
    options: ["Magnetism", "Gravity", "Friction", "Electricity"],
    correct: "Gravity",
    clue: "It’s what makes things fall and keeps planets in orbit."
  },
  {
    question: "Which organ pumps blood throughout the human body?",
    options: ["Lungs", "Heart", "Brain", "Kidneys"],
    correct: "Heart",
    clue: "This muscle works nonstop to keep you alive by moving blood."
  },
  {
    question: "What is the center of an atom called?",
    options: ["Electron", "Nucleus", "Proton", "Neutron"],
    correct: "Nucleus",
    clue: "This tiny core holds most of the atom’s mass."
  },
  {
    question: "Which gas do humans need to breathe to survive?",
    options: ["Nitrogen", "Carbon Dioxide", "Oxygen", "Helium"],
    correct: "Oxygen",
    clue: "Without this gas, our cells wouldn’t get the energy they need."
  },
  {
    question: "What is the boiling point of water at sea level in Celsius?",
    options: ["0°C", "50°C", "100°C", "212°C"],
    correct: "100°C",
    clue: "At this temperature, water changes from liquid to gas under normal pressure."
  },
  {
    question: "Which planet is the largest in our solar system?",
    options: ["Saturn", "Earth", "Jupiter", "Neptune"],
    correct: "Jupiter",
    clue: "This gas giant is famous for its size and a big red storm."
  },
  {
    question: "What do bees collect from flowers to make honey?",
    options: ["Nectar", "Pollen", "Water", "Leaves"],
    correct: "Nectar",
    clue: "A sweet liquid that’s the starting ingredient for honey."
  },
  {
    question: "Which part of the plant absorbs water from the soil?",
    options: ["Stem", "Root", "Leaf", "Flower"],
    correct: "Root",
    clue: "Hidden underground, these help anchor and hydrate the plant."
  },
  {
    question: "What type of energy comes from the sun?",
    options: ["Thermal", "Solar", "Kinetic", "Nuclear"],
    correct: "Solar",
    clue: "This energy powers photosynthesis and weather patterns."
  },
  {
    question: "What is the process by which caterpillars become butterflies?",
    options: ["Metamorphosis", "Photosynthesis", "Respiration", "Pollination"],
    correct: "Metamorphosis",
    clue: "A dramatic change in form and lifestyle during development."
  },
  {
    question: "Which planet is closest to the sun?",
    options: ["Venus", "Earth", "Mercury", "Mars"],
    correct: "Mercury",
    clue: "Small and speedy, it races closest to our star."
  },
  {
    question: "What are the building blocks of proteins?",
    options: ["Amino acids", "Sugars", "Fatty acids", "Nucleotides"],
    correct: "Amino acids",
    clue: "These small molecules link together to form life’s essential machines."
  },
  {
    question: "What is the main gas responsible for the greenhouse effect?",
    options: ["Oxygen", "Methane", "Carbon Dioxide", "Nitrogen"],
    correct: "Carbon Dioxide",
    clue: "This gas traps heat and is released by burning fossil fuels."
  },
  {
    question: "Which organ is responsible for filtering blood in the human body?",
    options: ["Liver", "Kidneys", "Heart", "Lungs"],
    correct: "Kidneys",
    clue: "These organs help remove waste through urine."
  },
  {
    question: "What is the name of the process plants use to convert sunlight into food?",
    options: ["Photosynthesis", "Respiration", "Fermentation", "Transpiration"],
    correct: "Photosynthesis",
    clue: "It turns light energy into chemical energy stored in sugars."
  },
  {
    question: "What particle in the nucleus of an atom has a positive charge?",
    options: ["Electron", "Neutron", "Proton", "Photon"],
    correct: "Proton",
    clue: "This particle defines the element’s identity."
  },
  {
    question: "Which gas makes up most of the Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correct: "Nitrogen",
    clue: "This gas is colorless, odorless, and about 78% of the air we breathe."
  },
  {
    question: "What organelle is known as the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
    correct: "Mitochondria",
    clue: "It produces energy in the form of ATP for the cell."
  },
  {
    question: "What is the smallest unit of life?",
    options: ["Atom", "Molecule", "Cell", "Organ"],
    correct: "Cell",
    clue: "All living things are made up of these tiny structures."
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Ag", "Au", "Fe", "Pb"],
    correct: "Au",
    clue: "This precious metal's symbol comes from its Latin name 'Aurum.'"
  },
  {
    question: "What is the process by which water changes from liquid to vapor?",
    options: ["Condensation", "Evaporation", "Freezing", "Sublimation"],
    correct: "Evaporation",
    clue: "It happens when heat causes water molecules to escape into the air."
  },
  {
    question: "Which planet has the most moons?",
    options: ["Saturn", "Mars", "Jupiter", "Neptune"],
    correct: "Saturn",
    clue: "Famous for its rings, it also has a large collection of moons."
  },
  {
    question: "What is the main function of roots in plants?",
    options: ["Photosynthesis", "Support and water absorption", "Reproduction", "Seed production"],
    correct: "Support and water absorption",
    clue: "They hold the plant steady and draw in moisture from the soil."
  },
  {
    question: "What do we call animals that only eat plants?",
    options: ["Carnivores", "Omnivores", "Herbivores", "Detritivores"],
    correct: "Herbivores",
    clue: "These creatures graze on leaves, fruits, and seeds."
  },
  {
    question: "Which planet is known for its beautiful rings?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correct: "Saturn",
    clue: "Its striking rings can be seen even with a small telescope."
  },
  {
    question: "What do you call the change of state from gas to liquid?",
    options: ["Evaporation", "Condensation", "Sublimation", "Freezing"],
    correct: "Condensation",
    clue: "This happens when water vapor cools and forms droplets."
  },
  {
    question: "Which organ in the human body controls thoughts and movement?",
    options: ["Heart", "Lungs", "Brain", "Liver"],
    correct: "Brain",
    clue: "This complex organ processes information and sends signals."
  },
  {
    question: "What type of rock is formed from cooled lava?",
    options: ["Sedimentary", "Igneous", "Metamorphic", "Fossil"],
    correct: "Igneous",
    clue: "These rocks originate from fiery molten material."
  },
  {
    question: "What do we call the natural satellite of the Earth?",
    options: ["Sun", "Mars", "Moon", "Venus"],
    correct: "Moon",
    clue: "It shines at night by reflecting sunlight."
  },
  {
    question: "Which blood cells help fight infections?",
    options: ["Red blood cells", "White blood cells", "Platelets", "Plasma"],
    correct: "White blood cells",
    clue: "These act as soldiers defending the body against germs."
  },
  {
    question: "What is the main source of energy for the Earth’s climate system?",
    options: ["Wind", "The Moon", "The Sun", "Ocean currents"],
    correct: "The Sun",
    clue: "Its energy drives weather, seasons, and life itself."
  },
  {
    question: "What is the term for animals that are active during the night?",
    options: ["Diurnal", "Nocturnal", "Crepuscular", "Migratory"],
    correct: "Nocturnal",
    clue: "These creatures rest during the day and hunt under moonlight."
  },
  {
    question: "What process allows plants to lose water vapor through their leaves?",
    options: ["Photosynthesis", "Transpiration", "Respiration", "Pollination"],
    correct: "Transpiration",
    clue: "It’s like sweating, but for plants."
  },
  {
    question: "What is the name of the galaxy we live in?",
    options: ["Andromeda", "Milky Way", "Sombrero", "Whirlpool"],
    correct: "Milky Way",
    clue: "Our solar system is part of this vast star-filled island."
  },
  {
    question: "Which element is most abundant in the Earth's crust?",
    options: ["Iron", "Oxygen", "Silicon", "Aluminum"],
    correct: "Oxygen",
    clue: "This element combines with others to form many minerals."
  },
  {
    question: "What is the term for animals that eat both plants and animals?",
    options: ["Herbivores", "Carnivores", "Omnivores", "Scavengers"],
    correct: "Omnivores",
    clue: "These animals have a flexible diet including meat and greens."
  },
  {
    question: "What do you call the female part of a flower?",
    options: ["Stamen", "Pistil", "Petal", "Sepal"],
    correct: "Pistil",
    clue: "It includes the ovary where seeds can develop."
  },
  {
    question: "What is the chemical symbol for oxygen?",
    options: ["O", "Ox", "Oy", "Og"],
    correct: "O",
    clue: "A single letter representing the gas we breathe."
  },
  {
    question: "What is the name of the process cells use to divide and multiply?",
    options: ["Meiosis", "Mitosis", "Photosynthesis", "Fermentation"],
    correct: "Mitosis",
    clue: "It creates two identical cells from one."
  },
  {
    question: "Which part of the human eye controls the amount of light entering?",
    options: ["Cornea", "Iris", "Retina", "Lens"],
    correct: "Iris",
    clue: "Its color and muscles adjust how much light passes through."
  },
  {
    question: "What type of energy is stored in food?",
    options: ["Kinetic energy", "Thermal energy", "Chemical energy", "Nuclear energy"],
    correct: "Chemical energy",
    clue: "This energy is released when food is broken down by the body."
  },
  {
    question: "What is the name of the largest organ in the human body?",
    options: ["Liver", "Skin", "Heart", "Lungs"],
    correct: "Skin",
    clue: "It covers and protects the entire body."
  },
  {
    question: "What do you call a scientist who studies rocks?",
    options: ["Biologist", "Geologist", "Meteorologist", "Physicist"],
    correct: "Geologist",
    clue: "They examine Earth’s solid materials and formations."
  },
  {
    question: "Which process breaks down glucose to release energy in cells?",
    options: ["Photosynthesis", "Respiration", "Fermentation", "Transpiration"],
    correct: "Respiration",
    clue: "It happens in cells to convert sugar into usable energy."
  },
  {
    question: "What is the primary gas found in bubbles of soda?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correct: "Carbon Dioxide",
    clue: "This gas creates fizz and bubbles in soft drinks."
  },
  {
    question: "What is the natural source of light for Earth during the day?",
    options: ["The Moon", "Stars", "The Sun", "Lightning"],
    correct: "The Sun",
    clue: "It’s a huge ball of burning gases that lights up our world."
  }
  ],
  medium: [
   {
    question: "Which quantum number defines the shape of an electron orbital?",
    options: ["Principal (n)", "Azimuthal (l)", "Magnetic (m)", "Spin (s)"],
    correct: "Azimuthal (l)",
    clue: "Determines orbital geometry.",
  },
  {
    question: "What property of a wave remains unchanged when passing from one medium to another?",
    options: ["Frequency", "Wavelength", "Speed", "Amplitude"],
    correct: "Frequency",
    clue: "Pitch stays constant.",
  },
  {
    question: "Which enzyme catalyzes the formation of RNA from a DNA template?",
    options: ["DNA polymerase", "RNA polymerase", "Ligase", "Helicase"],
    correct: "RNA polymerase",
    clue: "Builds RNA strand.",
  },
  {
    question: "What kind of bond holds the two strands of DNA together?",
    options: ["Ionic bonds", "Hydrogen bonds", "Covalent bonds", "Metallic bonds"],
    correct: "Hydrogen bonds",
    clue: "Weak attraction between bases.",
  },
  {
    question: "Which principle states that no two electrons in an atom can have identical quantum numbers?",
    options: ["Pauli exclusion principle", "Heisenberg uncertainty principle", "Hund’s rule", "Aufbau principle"],
    correct: "Pauli exclusion principle",
    clue: "Unique quantum identity.",
  },
  {
    question: "What is the typical charge of an electron?",
    options: ["+1", "0", "-1", "+2"],
    correct: "-1",
    clue: "Opposite to proton.",
  },
  {
    question: "In thermodynamics, which function combines enthalpy and entropy?",
    options: ["Gibbs free energy", "Internal energy", "Helmholtz free energy", "Work"],
    correct: "Gibbs free energy",
    clue: "Predicts spontaneity.",
  },
  {
    question: "Which part of the electromagnetic spectrum is used in MRI scans?",
    options: ["Radio waves", "X-rays", "Ultraviolet", "Gamma rays"],
    correct: "Radio waves",
    clue: "Longest wavelength waves.",
  },
  {
    question: "What is the charge and relative mass of a neutron?",
    options: ["Charge 0, mass 1", "Charge -1, mass 0", "Charge +1, mass 1", "Charge 0, mass 0"],
    correct: "Charge 0, mass 1",
    clue: "Neutral but heavy.",
  },
  {
    question: "Which process produces ATP in mitochondria by using a proton gradient?",
    options: ["Substrate-level phosphorylation", "Oxidative phosphorylation", "Glycolysis", "Fermentation"],
    correct: "Oxidative phosphorylation",
    clue: "Proton motive force powers it.",
  },
  {
    question: "What type of lens is thicker at the center than at the edges?",
    options: ["Concave lens", "Convex lens", "Plano lens", "Diverging lens"],
    correct: "Convex lens",
    clue: "Converges light rays.",
  },
  {
    question: "Which gas law relates volume and temperature at constant pressure?",
    options: ["Boyle’s Law", "Charles’s Law", "Gay-Lussac’s Law", "Avogadro’s Law"],
    correct: "Charles’s Law",
    clue: "Volume expands with heat.",
  },
  {
    question: "In ecology, what term describes the variety of species in an ecosystem?",
    options: ["Biomass", "Biodiversity", "Productivity", "Population"],
    correct: "Biodiversity",
    clue: "Species richness.",
  },
  {
    question: "What is the energy stored in chemical bonds called?",
    options: ["Kinetic energy", "Potential energy", "Chemical energy", "Thermal energy"],
    correct: "Chemical energy",
    clue: "Released during reactions.",
  },
  {
    question: "Which organelle in eukaryotic cells is responsible for protein synthesis?",
    options: ["Ribosome", "Golgi apparatus", "Mitochondrion", "Lysosome"],
    correct: "Ribosome",
    clue: "Reads mRNA code.",
  },
  {
    question: "Which property describes a material’s resistance to deformation?",
    options: ["Elasticity", "Viscosity", "Tensile strength", "Hardness"],
    correct: "Elasticity",
    clue: "Returns to original shape.",
  },
  {
    question: "What kind of reaction involves the loss of electrons?",
    options: ["Oxidation", "Reduction", "Hydrolysis", "Condensation"],
    correct: "Oxidation",
    clue: "Electron donor role.",
  },
  {
    question: "In which organelle does aerobic respiration primarily occur?",
    options: ["Chloroplast", "Nucleus", "Mitochondrion", "Endoplasmic reticulum"],
    correct: "Mitochondrion",
    clue: "Cell’s power plant.",
  },
  {
    question: "What is the term for the minimum energy required to start a chemical reaction?",
    options: ["Activation energy", "Bond energy", "Ionization energy", "Electronegativity"],
    correct: "Activation energy",
    clue: "Barrier for reactions.",
  },
  {
    question: "Which of the following is NOT a greenhouse gas?",
    options: ["Carbon dioxide", "Methane", "Oxygen", "Nitrous oxide"],
    correct: "Oxygen",
    clue: "Supports respiration, not warming.",
  },
  {
    question: "Which subatomic particle determines the element's identity?",
    options: ["Electron", "Proton", "Neutron", "Photon"],
    correct: "Proton",
    clue: "Defines atomic number.",
  },
  {
    question: "What is the primary structure of a protein determined by?",
    options: ["Amino acid sequence", "Hydrogen bonding", "R-group interactions", "Peptide folding"],
    correct: "Amino acid sequence",
    clue: "Linear chain order.",
  },
  {
    question: "Which law governs the conservation of electric charge?",
    options: ["Coulomb’s Law", "Ohm’s Law", "Conservation of charge", "Faraday’s Law"],
    correct: "Conservation of charge",
    clue: "Charge neither created nor destroyed.",
  },
  {
    question: "What is the unit of magnetic flux?",
    options: ["Tesla", "Weber", "Henry", "Gauss"],
    correct: "Weber",
    clue: "Named after a German physicist.",
  },
  {
    question: "Which particle accelerators use oscillating electric fields to increase particle energy?",
    options: ["Cyclotrons", "Synchrotrons", "Linear accelerators", "Betatrons"],
    correct: "Linear accelerators",
    clue: "Particles in straight line.",
  },
  {
    question: "In genetics, what term describes the observable traits of an organism?",
    options: ["Genotype", "Phenotype", "Allele", "Locus"],
    correct: "Phenotype",
    clue: "Physical expression of genes.",
  },
  {
    question: "Which element has the highest electronegativity?",
    options: ["Oxygen", "Fluorine", "Nitrogen", "Chlorine"],
    correct: "Fluorine",
    clue: "Most electron-attracting atom.",
  },
  {
    question: "What is the main function of the Golgi apparatus?",
    options: ["Protein synthesis", "Lipid synthesis", "Protein modification and sorting", "Energy production"],
    correct: "Protein modification and sorting",
    clue: "Cell’s post office.",
  },
  {
    question: "Which law states that the total pressure exerted by a gas mixture is the sum of partial pressures?",
    options: ["Dalton’s Law", "Boyle’s Law", "Charles’s Law", "Avogadro’s Law"],
    correct: "Dalton’s Law",
    clue: "Sum of gas pressures.",
  },
  {
    question: "What type of radioactive decay releases an alpha particle?",
    options: ["Beta decay", "Gamma decay", "Alpha decay", "Positron emission"],
    correct: "Alpha decay",
    clue: "Helium nucleus ejected.",
  },
  {
    question: "Which type of reaction involves the combination of two molecules with the loss of water?",
    options: ["Hydrolysis", "Dehydration synthesis", "Redox", "Isomerization"],
    correct: "Dehydration synthesis",
    clue: "Water molecule removed.",
  },
  {
    question: "Which scientist proposed the three laws of motion?",
    options: ["Newton", "Galileo", "Einstein", "Kepler"],
    correct: "Newton",
    clue: "Classical mechanics founder.",
  },
  {
    question: "What is the approximate pH of pure water at 25°C?",
    options: ["0", "7", "14", "1"],
    correct: "7",
    clue: "Neutral pH.",
  },
  {
    question: "Which vitamin is essential for calcium absorption in the human body?",
    options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"],
    correct: "Vitamin D",
    clue: "Sunshine vitamin.",
  },
  {
    question: "Which molecule is the universal energy currency of the cell?",
    options: ["DNA", "Glucose", "ATP", "NADH"],
    correct: "ATP",
    clue: "Energy 'coin' in cells.",
  },
  {
    question: "What is the fundamental force responsible for nuclear decay?",
    options: ["Gravitational force", "Weak nuclear force", "Electromagnetic force", "Strong nuclear force"],
    correct: "Weak nuclear force",
    clue: "Causes beta decay.",
  },
  {
    question: "Which organ in the human body regulates blood glucose levels?",
    options: ["Liver", "Pancreas", "Kidneys", "Spleen"],
    correct: "Pancreas",
    clue: "Produces insulin.",
  },
  {
    question: "What is the term for a reaction that absorbs heat from the surroundings?",
    options: ["Exothermic", "Endothermic", "Catalytic", "Spontaneous"],
    correct: "Endothermic",
    clue: "Heat enters system.",
  },
  {
    question: "Which property describes the amount of matter in an object?",
    options: ["Mass", "Weight", "Density", "Volume"],
    correct: "Mass",
    clue: "Amount of matter.",
  },
  {
    question: "What kind of crystal lattice structure does diamond have?",
    options: ["Body-centered cubic", "Face-centered cubic", "Tetrahedral covalent network", "Hexagonal close-packed"],
    correct: "Tetrahedral covalent network",
    clue: "Each carbon bonded to four others.",
  },
  {
    question: "What is the dominant wavelength of visible light emitted by the Sun?",
    options: ["400 nm", "500 nm", "600 nm", "700 nm"],
    correct: "500 nm",
    clue: "Around green portion of spectrum.",
  },
  {
    question: "Which enzyme catalyzes the formation of RNA from a DNA template?",
    options: ["DNA polymerase", "RNA polymerase", "Ligase", "Helicase"],
    correct: "RNA polymerase",
    clue: "Synthesizes RNA.",
  },
  {
    question: "What is the primary cause of the greenhouse effect on Earth?",
    options: ["Ozone layer depletion", "Carbon dioxide", "Solar flares", "Nitrogen"],
    correct: "Carbon dioxide",
    clue: "Main greenhouse gas from fossil fuels.",
  },
  {
    question: "Which type of bond involves the sharing of electron pairs between atoms?",
    options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"],
    correct: "Covalent bond",
    clue: "Electron sharing.",
  },
  {
    question: "What is the main function of ribosomes in a cell?",
    options: ["Energy production", "Protein synthesis", "DNA replication", "Waste removal"],
    correct: "Protein synthesis",
    clue: "Cell’s protein factories.",
  },
  {
    question: "Which law relates current, voltage, and resistance in an electrical circuit?",
    options: ["Ohm's Law", "Kirchhoff's Law", "Faraday's Law", "Coulomb's Law"],
    correct: "Ohm's Law",
    clue: "V = IR.",
  },
  {
    question: "What is the name of the process where plants convert light energy into chemical energy?",
    options: ["Respiration", "Photosynthesis", "Fermentation", "Transpiration"],
    correct: "Photosynthesis",
    clue: "Produces glucose and oxygen.",
  },
  {
    question: "Which organelle is responsible for cellular respiration in eukaryotic cells?",
    options: ["Chloroplast", "Mitochondrion", "Golgi apparatus", "Endoplasmic reticulum"],
    correct: "Mitochondrion",
    clue: "Cell powerhouse.",
  },
  {
    question: "What is the name of the particle with a positive charge found in the nucleus?",
    options: ["Electron", "Proton", "Neutron", "Positron"],
    correct: "Proton",
    clue: "Defines atomic number.",
  },
  {
    question: "Which gas law relates pressure and temperature at constant volume?",
    options: ["Boyle’s Law", "Charles’s Law", "Gay-Lussac’s Law", "Avogadro’s Law"],
    correct: "Gay-Lussac’s Law",
    clue: "Pressure proportional to temperature.",
  },
  {
    question: "What is the typical wavelength range of X-rays?",
    options: ["10–400 nm", "0.01–10 nm", "400–700 nm", "1–100 µm"],
    correct: "0.01–10 nm",
    clue: "Between UV and gamma rays.",
  },
  {
    question: "Which of these is a nonpolar molecule?",
    options: ["Water", "Methane", "Ammonia", "Hydrogen chloride"],
    correct: "Methane",
    clue: "Symmetrical tetrahedral molecule.",
  },
  {
    question: "What kind of reaction is photosynthesis in terms of energy?",
    options: ["Exothermic", "Endothermic", "Neutral", "Spontaneous"],
    correct: "Endothermic",
    clue: "Energy absorbed from light.",
  },
  {
    question: "Which principle explains why a fluid's pressure decreases as its velocity increases?",
    options: ["Pascal’s Principle", "Archimedes’ Principle", "Bernoulli’s Principle", "Boyle’s Law"],
    correct: "Bernoulli’s Principle",
    clue: "Fluid dynamics law.",
  },
  {
    question: "Which organ system regulates hormones in the human body?",
    options: ["Nervous system", "Endocrine system", "Digestive system", "Respiratory system"],
    correct: "Endocrine system",
    clue: "Gland secretion control.",
  },
  {
    question: "Which subatomic particle has no electric charge?",
    options: ["Electron", "Proton", "Neutron", "Positron"],
    correct: "Neutron",
    clue: "Neutral particle in nucleus.",
  },
  {
    question: "What is the chemical formula for glucose?",
    options: ["C6H12O6", "C12H22O11", "C2H5OH", "CH4"],
    correct: "C6H12O6",
    clue: "Common sugar molecule.",
  },
  {
    question: "Which process splits water molecules during photosynthesis?",
    options: ["Light-dependent reactions", "Calvin cycle", "Respiration", "Fermentation"],
    correct: "Light-dependent reactions",
    clue: "Produces oxygen and electrons.",
  },
  {
    question: "Which particle is considered the carrier of the electromagnetic force?",
    options: ["Photon", "Electron", "Gluon", "Neutrino"],
    correct: "Photon",
    clue: "Massless light particle.",
  },
  {
    question: "Which law states that energy cannot be created or destroyed?",
    options: ["Second law of thermodynamics", "First law of thermodynamics", "Third law of thermodynamics", "Law of conservation of mass"],
    correct: "First law of thermodynamics",
    clue: "Energy conservation.",
  }

  ],
  hard: [
 {
    question: "Which quantum number describes the orientation of an electron's orbital angular momentum?",
    options: ["Principal quantum number (n)", "Azimuthal quantum number (l)", "Magnetic quantum number (mₗ)", "Spin quantum number (mₛ)"],
    correct: "Magnetic quantum number (mₗ)",
    clue: "It determines orbital direction in space."
  },
  {
    question: "In enzyme kinetics, what does the Michaelis constant (Kₘ) represent?",
    options: ["Maximum reaction rate", "Substrate concentration at half Vmax", "Enzyme concentration", "Inhibitor concentration"],
    correct: "Substrate concentration at half Vmax",
    clue: "Reflects enzyme affinity for substrate."
  },
  {
    question: "Which principle explains the simultaneous measurement limit of position and momentum of a particle?",
    options: ["Pauli exclusion principle", "Heisenberg uncertainty principle", "Bohr correspondence principle", "Hund's rule"],
    correct: "Heisenberg uncertainty principle",
    clue: "Limits precision in quantum mechanics."
  },
  {
    question: "What type of radioactive decay involves the emission of a helium nucleus?",
    options: ["Alpha decay", "Beta decay", "Gamma decay", "Positron emission"],
    correct: "Alpha decay",
    clue: "Emits a particle with 2 protons and 2 neutrons."
  },
  {
    question: "In thermodynamics, which function represents the maximum work obtainable from a system at constant temperature and pressure?",
    options: ["Gibbs free energy", "Enthalpy", "Internal energy", "Entropy"],
    correct: "Gibbs free energy",
    clue: "Determines spontaneity under T and P."
  },
  {
    question: "What is the main driving force behind the formation of lipid bilayers in cell membranes?",
    options: ["Hydrogen bonding", "Ionic interactions", "Hydrophobic effect", "Van der Waals forces"],
    correct: "Hydrophobic effect",
    clue: "Water drives nonpolar tails inward."
  },
  {
    question: "In quantum chemistry, which approximation assumes electrons move independently in an average field created by all other electrons?",
    options: ["Born-Oppenheimer approximation", "Hartree-Fock approximation", "Perturbation theory", "Density functional theory"],
    correct: "Hartree-Fock approximation",
    clue: "Mean-field approach to electron behavior."
  },
  {
    question: "Which of the following is a second messenger in cellular signaling pathways?",
    options: ["cAMP", "DNA polymerase", "ATP synthase", "Hemoglobin"],
    correct: "cAMP",
    clue: "Transmits signals inside cells."
  },
  {
    question: "In population genetics, what term describes the change in allele frequency due to random sampling?",
    options: ["Natural selection", "Gene flow", "Genetic drift", "Mutation"],
    correct: "Genetic drift",
    clue: "Random fluctuation in small populations."
  },
  {
    question: "Which molecule is the immediate electron donor in the electron transport chain of mitochondria?",
    options: ["NADH", "FADH2", "ATP", "Oxygen"],
    correct: "NADH",
    clue: "Primary electron source entering ETC."
  },
  {
    question: "What phenomenon explains the bending of light as it passes through mediums of different densities?",
    options: ["Reflection", "Diffraction", "Refraction", "Polarization"],
    correct: "Refraction",
    clue: "Change in light speed causes bending."
  },
  {
    question: "In organic chemistry, what type of reaction involves the addition of a nucleophile to an electrophilic carbon?",
    options: ["Elimination", "Substitution", "Addition", "Oxidation"],
    correct: "Addition",
    clue: "Common in unsaturated compounds."
  },
  {
    question: "Which hormone regulates calcium ion concentration in the blood by increasing bone resorption?",
    options: ["Calcitonin", "Parathyroid hormone", "Insulin", "Glucagon"],
    correct: "Parathyroid hormone",
    clue: "Raises blood calcium levels."
  },
  {
    question: "Which fundamental interaction is mediated by gluons?",
    options: ["Electromagnetic force", "Weak nuclear force", "Strong nuclear force", "Gravity"],
    correct: "Strong nuclear force",
    clue: "Binds quarks inside protons."
  },
  {
    question: "Which thermodynamic quantity is a measure of disorder or randomness in a system?",
    options: ["Enthalpy", "Entropy", "Free energy", "Internal energy"],
    correct: "Entropy",
    clue: "Second law of thermodynamics relates to it."
  },
  {
    question: "What is the wavelength range of gamma rays in the electromagnetic spectrum?",
    options: ["Less than 0.01 nm", "400-700 nm", "10-400 nm", "1-100 µm"],
    correct: "Less than 0.01 nm",
    clue: "Highest energy photons."
  },
  {
    question: "In genetics, what is the term for a sequence variant that does not change the amino acid sequence of a protein?",
    options: ["Missense mutation", "Nonsense mutation", "Silent mutation", "Frameshift mutation"],
    correct: "Silent mutation",
    clue: "No change in encoded amino acid."
  },
  {
    question: "Which law states that the total pressure exerted by a mixture of gases equals the sum of the partial pressures of individual gases?",
    options: ["Boyle’s Law", "Dalton’s Law", "Charles’s Law", "Avogadro’s Law"],
    correct: "Dalton’s Law",
    clue: "Partial pressures add up."
  },
  {
    question: "Which process in the cell cycle ensures that DNA is duplicated before mitosis?",
    options: ["G1 phase", "S phase", "G2 phase", "M phase"],
    correct: "S phase",
    clue: "DNA synthesis phase."
  },
  {
    question: "What type of inhibition occurs when an inhibitor binds to an enzyme at a site other than the active site?",
    options: ["Competitive inhibition", "Non-competitive inhibition", "Uncompetitive inhibition", "Allosteric inhibition"],
    correct: "Non-competitive inhibition",
    clue: "Binds away from active site."
  },
  {
    question: "What is the primary function of ribosomes in a cell?",
    options: ["DNA replication", "Protein synthesis", "Lipid metabolism", "Energy production"],
    correct: "Protein synthesis",
    clue: "They translate mRNA into polypeptides."
  },
  {
    question: "Which element has the highest electronegativity on the periodic table?",
    options: ["Oxygen", "Fluorine", "Chlorine", "Nitrogen"],
    correct: "Fluorine",
    clue: "Most electronegative halogen."
  },
  {
    question: "In optics, what is the name of the phenomenon where light waves interfere destructively causing dark fringes?",
    options: ["Diffraction", "Refraction", "Constructive interference", "Destructive interference"],
    correct: "Destructive interference",
    clue: "Waves cancel out."
  },
  {
    question: "Which cellular organelle is responsible for ATP production through oxidative phosphorylation?",
    options: ["Nucleus", "Golgi apparatus", "Mitochondrion", "Lysosome"],
    correct: "Mitochondrion",
    clue: "Known as the cell’s powerhouse."
  },
  {
    question: "Which amino acid is coded by the start codon AUG in mRNA?",
    options: ["Methionine", "Leucine", "Serine", "Valine"],
    correct: "Methionine",
    clue: "First amino acid in protein synthesis."
  },
  {
    question: "Which type of chemical bond involves the sharing of electron pairs between atoms?",
    options: ["Ionic bond", "Covalent bond", "Hydrogen bond", "Metallic bond"],
    correct: "Covalent bond",
    clue: "Strong bond formed by shared electrons."
  },
  {
    question: "In a redox reaction, what is the agent that gains electrons called?",
    options: ["Oxidizing agent", "Reducing agent", "Catalyst", "Inhibitor"],
    correct: "Oxidizing agent",
    clue: "It causes another species to lose electrons."
  },
  {
    question: "Which law states that the energy of a photon is proportional to its frequency?",
    options: ["Planck’s law", "Boyle’s law", "Avogadro’s law", "Faraday’s law"],
    correct: "Planck’s law",
    clue: "E = hν."
  },
  {
    question: "What is the effect of increasing substrate concentration on enzyme activity, assuming enzyme is limiting?",
    options: ["Linear increase indefinitely", "Plateaus at Vmax", "Decreases", "No effect"],
    correct: "Plateaus at Vmax",
    clue: "Saturation of enzyme active sites."
  },
  {
    question: "In genetics, what process describes the exchange of genetic material between homologous chromosomes during meiosis?",
    options: ["Mutation", "Crossing over", "Independent assortment", "Replication"],
    correct: "Crossing over",
    clue: "Increases genetic diversity."
  },
  {
    question: "What type of radiation has the greatest penetrating power?",
    options: ["Alpha particles", "Beta particles", "Gamma rays", "Ultraviolet rays"],
    correct: "Gamma rays",
    clue: "Highly energetic electromagnetic waves."
  },
  {
    question: "Which fundamental particle mediates the weak nuclear force?",
    options: ["Photon", "Gluon", "W and Z bosons", "Graviton"],
    correct: "W and Z bosons",
    clue: "Responsible for radioactive decay."
  },
  {
    question: "What is the main product of the Calvin cycle in photosynthesis?",
    options: ["Oxygen", "Glucose", "ATP", "NADPH"],
    correct: "Glucose",
    clue: "Sugar synthesized from CO₂."
  },
  {
    question: "Which physical principle explains why ships float on water?",
    options: ["Pascal’s principle", "Archimedes’ principle", "Bernoulli’s principle", "Newton’s third law"],
    correct: "Archimedes’ principle",
    clue: "Buoyant force equals weight of displaced fluid."
  },
  {
    question: "In molecular biology, what is the function of a promoter region in DNA?",
    options: ["Protein coding", "Binding site for RNA polymerase", "Termination signal", "Replication origin"],
    correct: "Binding site for RNA polymerase",
    clue: "Starts transcription."
  },
  {
    question: "Which of the following elements is a transition metal?",
    options: ["Sodium", "Calcium", "Iron", "Chlorine"],
    correct: "Iron",
    clue: "Commonly found in hemoglobin."
  },
  {
    question: "What type of crystal defect is characterized by an extra half-plane of atoms inserted in a crystal lattice?",
    options: ["Vacancy", "Interstitial defect", "Edge dislocation", "Substitutional defect"],
    correct: "Edge dislocation",
    clue: "Causes slip in metals."
  },
  {
    question: "Which molecule serves as the primary energy currency of the cell?",
    options: ["NADH", "ATP", "Glucose", "cAMP"],
    correct: "ATP",
    clue: "Stores energy in phosphate bonds."
  },
  {
    question: "Which of these is a fundamental difference between prokaryotic and eukaryotic cells?",
    options: ["Presence of cell membrane", "Presence of nucleus", "Use of DNA", "Use of ribosomes"],
    correct: "Presence of nucleus",
    clue: "Eukaryotes have a membrane-bound nucleus."
  },
  {
    question: "What is the pH of a neutral solution at 25°C?",
    options: ["0", "7", "14", "1"],
    correct: "7",
    clue: "Neither acidic nor basic."
  },
  {
    question: "Which process converts pyruvate to acetyl-CoA before entering the Krebs cycle?",
    options: ["Glycolysis", "Pyruvate decarboxylation", "Fermentation", "Beta-oxidation"],
    correct: "Pyruvate decarboxylation",
    clue: "Links glycolysis and Krebs cycle."
  },
  {
    question: "What is the main characteristic of a non-competitive enzyme inhibitor?",
    options: ["Binds active site", "Binds allosteric site", "Increases enzyme activity", "Binds substrate"],
    correct: "Binds allosteric site",
    clue: "Changes enzyme shape, not substrate binding."
  },
  {
    question: "In quantum mechanics, what principle states that no two electrons can have the same set of quantum numbers?",
    options: ["Pauli exclusion principle", "Heisenberg uncertainty principle", "Hund's rule", "Aufbau principle"],
    correct: "Pauli exclusion principle",
    clue: "Electron uniqueness rule."
  },
  {
    question: "Which organelle contains enzymes responsible for lipid synthesis and detoxification?",
    options: ["Smooth endoplasmic reticulum", "Rough endoplasmic reticulum", "Golgi apparatus", "Lysosome"],
    correct: "Smooth endoplasmic reticulum",
    clue: "No ribosomes attached."
  },
  {
    question: "What does the Nernst equation calculate?",
    options: ["Equilibrium potential", "Reaction rate", "pH level", "Solubility product"],
    correct: "Equilibrium potential",
    clue: "Voltage for ion across membrane."
  },
  {
    question: "Which amino acid has a sulfur atom in its side chain?",
    options: ["Cysteine", "Serine", "Lysine", "Phenylalanine"],
    correct: "Cysteine",
    clue: "Forms disulfide bonds."
  },
  {
    question: "What type of mutation results in a single base substitution that changes one amino acid?",
    options: ["Nonsense", "Missense", "Silent", "Frameshift"],
    correct: "Missense",
    clue: "Alters protein sequence."
  },
  {
    question: "Which branch of physics studies the behavior of matter and energy at atomic and subatomic levels?",
    options: ["Classical mechanics", "Quantum mechanics", "Thermodynamics", "Electrodynamics"],
    correct: "Quantum mechanics",
    clue: "Deals with wave-particle duality."
  },
  {
    question: "What type of bond forms between a metal and a nonmetal in ionic compounds?",
    options: ["Covalent", "Ionic", "Hydrogen", "Van der Waals"],
    correct: "Ionic",
    clue: "Electron transfer creates charged ions."
  },
  {
    question: "Which process results in the synthesis of glucose during photosynthesis?",
    options: ["Light reactions", "Calvin cycle", "Photorespiration", "Chemiosmosis"],
    correct: "Calvin cycle",
    clue: "Carbon fixation phase."
  },
  {
    question: "What is the term for a catalyst made from RNA?",
    options: ["Ribozyme", "Enzyme", "Coenzyme", "Apoenzyme"],
    correct: "Ribozyme",
    clue: "RNA with catalytic activity."
  },
  {
    question: "In thermodynamics, what does the second law state about entropy?",
    options: ["Entropy decreases", "Entropy remains constant", "Entropy increases", "Entropy is irrelevant"],
    correct: "Entropy increases",
    clue: "Disorder always rises."
  },
  {
    question: "Which theory describes the behavior of gases based on molecular motion?",
    options: ["Kinetic molecular theory", "Boyle’s law", "Charles’s law", "Dalton’s law"],
    correct: "Kinetic molecular theory",
    clue: "Gas particles are in constant motion."
  },
  {
    question: "Which element is essential in the active site of hemoglobin for oxygen binding?",
    options: ["Iron", "Magnesium", "Calcium", "Zinc"],
    correct: "Iron",
    clue: "Central metal in heme group."
  },
  {
    question: "What does the Hardy-Weinberg principle describe in populations?",
    options: ["Allele frequency change", "Genetic equilibrium", "Natural selection", "Speciation"],
    correct: "Genetic equilibrium",
    clue: "No evolution without disturbance."
  },
  {
    question: "Which type of RNA carries amino acids to the ribosome during translation?",
    options: ["mRNA", "tRNA", "rRNA", "snRNA"],
    correct: "tRNA",
    clue: "Adaptor molecule."
  },
  {
    question: "What is the term for the energy barrier that must be overcome for a reaction to proceed?",
    options: ["Activation energy", "Gibbs free energy", "Enthalpy", "Entropy"],
    correct: "Activation energy",
    clue: "Threshold for chemical reactions."
  },
  {
    question: "Which physicist formulated the laws of planetary motion?",
    options: ["Newton", "Kepler", "Einstein", "Galileo"],
    correct: "Kepler",
    clue: "Elliptical orbits."
  },
  {
    question: "In ecology, what term describes the total number of individuals in a population per unit area?",
    options: ["Population density", "Carrying capacity", "Biodiversity", "Niche"],
    correct: "Population density",
    clue: "Individuals per area."
  },
  {
    question: "Which molecule acts as the final electron acceptor in aerobic respiration?",
    options: ["Oxygen", "Carbon dioxide", "NAD+", "FAD"],
    correct: "Oxygen",
    clue: "Forms water after accepting electrons."
  }
  ],
};

const getDifficulty = (score) => {
  if (score <= 300) return "easy";
  if (score <= 600) return "medium";
  return "hard";
};

const QuizGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userXP, setUserXP] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [authState, setAuthState] = useState(null);
  const [userLevel, setUserLevel] = useState("Noob");
  const [timer, setTimer] = useState(30);
  const [showClue, setShowClue] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [openGameOverDialog, setOpenGameOverDialog] = useState(false);
  const [highestScore, setHighestScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [usedIndices, setUsedIndices] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const correctSoundRef = useRef(null);
  const incorrectSoundRef = useRef(null);
  const [xpCoins, setXpCoins] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
const audioRef = useRef(null);
const [currentTrackIndex, setCurrentTrackIndex] = useState(0);


const tracks = [
  "https://res.cloudinary.com/db7fyg4z1/video/upload/v1749171551/quiz-countdown-194417_ivhdou.mp3",
  "https://res.cloudinary.com/db7fyg4z1/video/upload/v1749236329/quiz-evaluation-loop-thinking-time-231582_pprkcu.mp3",
  "https://res.cloudinary.com/db7fyg4z1/video/upload/v1749236549/ticking-time-action-countdown-loop-283365_qhyvqm.mp3",
  "https://res.cloudinary.com/db7fyg4z1/video/upload/v1749236543/breaking-news-countdown-report-loop-264533_ibroj4.mp3"
];

// Play music only when game starts
useEffect(() => {
  const audio = audioRef.current;
  if (gameStarted && audio) {
    audio.src = tracks[currentTrackIndex];
    audio.play().catch((err) => console.error("Audio play failed:", err));
  }
}, [gameStarted, currentTrackIndex]);

const handleAudioEnded = () => {
  setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
};




  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthState(user);
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserXP(data.xp || 0);
          setUserLevel(getUserLevel(data.xp || 0));
          setHighestScore(data.highestScore || 0);
        } else {
          await setDoc(userRef, { xp: 0, highestScore: 0 });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (timer > 0 && feedback === "" && gameStarted && !gameOver) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      endGame();
    }
  }, [timer, feedback, gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setUsedIndices([]);
    setCorrectStreak(0);
    setTimer(30);
    setFeedback("");
    setShowClue(false);
    loadNextQuestion();

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.muted = isMuted;
      audioRef.current.play().catch((e) => console.warn("Autoplay blocked:", e));
      
    }
  };

  const quitGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setOpenGameOverDialog(false);
    setFeedback("");
    setShowClue(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const endGame = () => {
    setGameOver(true);
    setOpenGameOverDialog(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const updateProgress = async (newXP) => {
    if (!authState) return;
    const userRef = doc(db, "users", authState.uid);
    const newHigh = Math.max(highestScore, newXP);
    const newLevel = getUserLevel(newXP);

    await setDoc(userRef, { xp: newXP, highestScore: newHigh }, { merge: true });

    setUserLevel(newLevel);
    setHighestScore(newHigh);
  };

 const getQuestion = () => {
  const difficulty = getDifficulty(highestScore);
  const pool = questionsByDifficulty[difficulty];

  // Get only unused questions
  const unused = pool
    .map((q, i) => ({ q, i })) // include index
    .filter(({ i }) => !usedIndices.includes(`${difficulty}-${i}`));

  if (unused.length === 0) return null;

  // Shuffle unused questions for stronger randomness
  const shuffled = unused.sort(() => Math.random() - 0.5);

  const { q: question, i: index } = shuffled[0];
  setUsedIndices((prev) => [...prev, `${difficulty}-${index}`]);
  return question;
};


  const loadNextQuestion = () => {
    const q = getQuestion();
    if (!q) {
      endGame();
      return;
    }
    setCurrentQuestion(q);
    setTimer(30);
    setSelectedAnswer(null);

  };

const handleAnswer = (selected) => { 
  if (!currentQuestion) return;
  setSelectedAnswer(selected);

  if (selected === currentQuestion.correct) {
    // Play correct sound
    if (correctSoundRef.current && !isMuted) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch((e) => console.warn("Sound play error:", e));
    }

   let baseXP = 5;
   const timeBonus = timer > 20 ? 5 : timer > 10 ? 3 : 0;
   let xpGain = baseXP + timeBonus;

    let newStreak = correctStreak + 1;

    if (newStreak === 3) {
      xpGain += 10;
      alert("🔥 3 Correct Answers in a Row! +10 Bonus XP");
    } else if (newStreak === 5) {
      xpGain += 20;
      alert("💥 5 Streak! +20 Bonus XP");
    } else if (newStreak === 10) {
      xpGain += 50;
      alert("🚀 10x Streak! +50 Bonus XP");
    }

    const newXP = userXP + xpGain;
    setUserXP(newXP);
    setCorrectStreak(newStreak);
    updateProgress(newXP);
  setFeedback(`✅ Correct! You earned ${baseXP} XP + ${timeBonus} Time Bonus XP.`);

  } else {
   
    if (incorrectSoundRef.current && !isMuted) {
      incorrectSoundRef.current.currentTime = 0;
      incorrectSoundRef.current.play().catch((e) => console.warn("Sound play error:", e));
    }

    setFeedback(`❌ Incorrect! Correct answer: ${currentQuestion.correct}`);
    setCorrectStreak(0);
  }

  setTimeout(() => {
    setFeedback("");
    loadNextQuestion();
  }, 2000);
};

const toggleMute = () => {
  setIsMuted((prev) => {
    const newState = !prev;

    if (audioRef.current) audioRef.current.muted = newState;
    if (correctSoundRef.current) correctSoundRef.current.muted = newState;
    if (incorrectSoundRef.current) incorrectSoundRef.current.muted = newState;

    return newState;
  });
};


 return (
  <div className="flex flex-col items-center p-4 mt-10 relative">
    {/* Background music */}
    <audio
      ref={audioRef}
      onEnded={handleAudioEnded}
      autoPlay
    />
   <audio ref={correctSoundRef} src="https://res.cloudinary.com/db7fyg4z1/video/upload/v1749174119/correct-6033_cklfcu.mp3" />
  <audio ref={incorrectSoundRef} src="https://res.cloudinary.com/db7fyg4z1/video/upload/v1749173786/error-126627_hlucqf.mp3" />

      {/* Volume Toggle Button (appears only after game starts) */}
      {gameStarted && (
        <motion.div
          className="absolute top-4 right-4"
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <IconButton onClick={toggleMute} color="primary">
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </motion.div>
      )}

      {!gameStarted ? (
        <>
          <img
            src="https://res.cloudinary.com/db7fyg4z1/image/upload/v1749053167/SCience_QUIZ_qy2y2b.png"
            width="100%"
            alt="Science Quiz Banner"
          />
          <br /><br></br>
          <Button variant="contained" onClick={startGame}>
            Start Game
          </Button>
          <Leaderboard />
        </>
      ) : currentQuestion ? (
        <>
          <Card className="w-full max-w-md p-4">
            <CardContent>
              <h1 className="text-xl font-bold mb-4">Science Quiz</h1>
              <motion.div
                key={currentQuestion.question}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-lg font-medium mb-4">
                  {currentQuestion.question}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((opt, idx) => (
                   <Button
  key={idx}
  onClick={() => handleAnswer(opt)}
  variant="contained"
  disabled={selectedAnswer !== null} // Disable after answer is selected
  style={{
    backgroundColor:
      selectedAnswer === null
        ? undefined
        : opt === currentQuestion.correct
        ? "green"
        : opt === selectedAnswer
        ? "red"
        : undefined,
    color: selectedAnswer !== null ? "white" : undefined,
  }}
>
  {opt}
</Button>

                  ))}
                </div>
              </motion.div>
              {feedback && (
                <div className="mt-4 text-center text-green-600">{feedback}</div>
              )}
              <div className="mt-4 text-center">
                <h4 className="font-bold">Time Left: {timer}s</h4>
                {showClue ? (
                  <Tooltip title={currentQuestion.clue} arrow>
                    <Button onClick={() => setShowClue(false)}>Hide Clue</Button>
                  </Tooltip>
                ) : (
                  <Button onClick={() => setShowClue(true)}>Show Clue</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <p>Total XP: {userXP}</p>
            <p>Streak: {correctStreak}</p>
            <p>Level: {userLevel}</p>
            <p>Highest Score: {highestScore}</p>
          </div>

          <ProgressTracker xp={userXP} />

          <Button className="mt-4" variant="contained" color="error" onClick={quitGame}>
            Quit Game
          </Button>
        </>
      ) : null}

      <Dialog open={openGameOverDialog} onClose={() => setOpenGameOverDialog(false)}>
        <DialogTitle>Game Over</DialogTitle>
        <DialogContent>
          <p>Your time is up!</p>
          <p>Total XP: {userXP}</p>
          <p>Level: {userLevel}</p>
          <p>Highest Score: {highestScore}</p>
          {authState && <UserRank userId={authState.uid} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={quitGame} color="primary">
            Quit
          </Button>
          <Button onClick={startGame} color="primary">
            Restart
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const ProgressTracker = ({ xp }) => {
  let current = levelThresholds[0];
  let next = levelThresholds[1];

  for (let i = 0; i < levelThresholds.length; i++) {
    if (xp >= levelThresholds[i].xpRange[0] && xp <= levelThresholds[i].xpRange[1]) {
      current = levelThresholds[i];
      next = levelThresholds[i + 1] || levelThresholds[i];
      break;
    }
  }

  const total = next.xpRange[0] - current.xpRange[0];
  const progress = xp - current.xpRange[0];
  const percentage = (progress / total) * 100;

  return (
    <Card className="w-full max-w-md mt-6">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Progress Tracker</h2>
        <div className="w-full bg-gray-200 h-4 rounded">
          <div
            className="h-4 bg-blue-500 rounded"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-sm mt-2">
          Level: {current.level} ➜ {next.level}
        </p>
      </CardContent>
    </Card>
  );
};

export default QuizGame;
