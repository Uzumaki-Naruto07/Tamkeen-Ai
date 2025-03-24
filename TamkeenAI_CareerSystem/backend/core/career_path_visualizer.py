"""
Career Path Visualizer Module

This module generates visual representations of career paths, skill relationships,
and career progression options based on user profiles and industry data.
"""

import os
import json
import math
import random
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import other core modules
from .career_guidance import CareerGuidance

# Import settings
from config.settings import BASE_DIR, DEFAULT_CHART_COLORS

# Try importing visualization libraries
try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False
    print("Warning: networkx not available. Install with: pip install networkx")

try:
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    import matplotlib.pyplot as plt
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    print("Warning: matplotlib not available. Install with: pip install matplotlib")


class CareerPathVisualizer:
    """Class for generating career path visualizations"""
    
    def __init__(self):
        """Initialize with necessary data"""
        self.guidance = CareerGuidance()
        self.output_dir = os.path.join(BASE_DIR, 'static', 'visualizations')
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate_career_progression_data(self, 
                                         current_role: str, 
                                         career_path_id: str, 
                                         current_skills: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Generate data for visualizing career progression steps
        
        Args:
            current_role: User's current job role
            career_path_id: ID of the career path to visualize
            current_skills: List of user's current skills
            
        Returns:
            dict: Data structure for visualization
        """
        # Get career path data
        career_path = self.guidance.career_paths.get(career_path_id)
        if not career_path or "progression" not in career_path:
            return {
                "error": f"Career path '{career_path_id}' not found",
                "available_paths": list(self.guidance.career_paths.keys())
            }
        
        # Find current position in progression
        progression = career_path.get("progression", [])
        current_level = 0
        
        for i, level in enumerate(progression):
            if level.get("title", "").lower() == current_role.lower():
                current_level = i
                break
        
        # Prepare visualization data
        nodes = []
        edges = []
        levels = []
        
        # Add nodes for each career level
        for i, level in enumerate(progression):
            node_data = {
                "id": f"level_{i}",
                "title": level.get("title", f"Level {i+1}"),
                "level": i + 1,
                "years_experience": level.get("years_experience", ""),
                "key_skills": level.get("key_skills", []),
                "description": level.get("description", ""),
                "current": (i == current_level)
            }
            
            # Analyze skill gaps if current skills provided
            if current_skills and "key_skills" in level:
                required_skills = [s.lower() for s in level["key_skills"]]
                user_skills = [s.lower() for s in current_skills]
                
                # Find missing skills
                missing_skills = [s for s in required_skills if s not in user_skills]
                node_data["missing_skills"] = missing_skills
                node_data["skill_match_percent"] = round(
                    (len(required_skills) - len(missing_skills)) / len(required_skills) * 100 
                    if required_skills else 100
                )
            
            nodes.append(node_data)
            levels.append(node_data)
            
            # Add edge to next level if not the last one
            if i < len(progression) - 1:
                edges.append({
                    "source": f"level_{i}",
                    "target": f"level_{i+1}",
                    "type": "progression"
                })
        
        # Add alternative paths or branches if available
        alternative_paths = career_path.get("alternative_paths", [])
        for alt_path in alternative_paths:
            from_level = alt_path.get("from_level", 0)
            to_path = alt_path.get("to_path", "")
            to_level = alt_path.get("to_level", 0)
            
            if from_level < len(progression) and to_path in self.guidance.career_paths:
                alt_career = self.guidance.career_paths[to_path]
                if "progression" in alt_career and to_level < len(alt_career["progression"]):
                    alt_level = alt_career["progression"][to_level]
                    
                    # Add node for alternative path
                    alt_node_id = f"alt_{to_path}_{to_level}"
                    alt_node = {
                        "id": alt_node_id,
                        "title": alt_level.get("title", f"Alternative {to_level+1}"),
                        "level": to_level + 1,
                        "years_experience": alt_level.get("years_experience", ""),
                        "key_skills": alt_level.get("key_skills", []),
                        "description": alt_level.get("description", ""),
                        "path": to_path,
                        "alternative": True
                    }
                    nodes.append(alt_node)
                    
                    # Add edge from current path to alternative
                    edges.append({
                        "source": f"level_{from_level}",
                        "target": alt_node_id,
                        "type": "alternative"
                    })
        
        return {
            "career_path": career_path.get("title", career_path_id),
            "description": career_path.get("description", ""),
            "current_role": current_role,
            "current_level": current_level + 1,
            "nodes": nodes,
            "edges": edges,
            "levels": levels,
            "visualization_type": "career_progression"
        }
    
    def create_career_graph_data(self, current_role: str, depth: int = 2) -> Dict[str, Any]:
        """
        Create data for a network graph of related career paths
        
        Args:
            current_role: Current job role
            depth: How many degrees of separation to include
            
        Returns:
            dict: Network graph data
        """
        if not NETWORKX_AVAILABLE:
            return {"error": "NetworkX library not available", "data": None}
        
        # Create a graph
        G = nx.Graph()
        
        # Find the job role data
        role_id = None
        for rid, role_data in self.guidance.job_roles.items():
            if role_data.get("title", "").lower() == current_role.lower():
                role_id = rid
                break
        
        if not role_id:
            return {
                "error": f"Job role '{current_role}' not found",
                "available_roles": [r.get("title") for r in self.guidance.job_roles.values()]
            }
        
        # Add the current role as the central node
        center_node = self.guidance.job_roles[role_id]
        G.add_node(role_id, 
                  title=center_node.get("title", role_id),
                  level=0,  # Central node
                  type="current",
                  skills=center_node.get("required_skills", []))
        
        # Add related roles based on shared skills and career paths
        processed_nodes = {role_id}
        nodes_by_level = {0: [role_id]}
        
        for level in range(1, depth + 1):
            nodes_by_level[level] = []
            
            # Process each node from the previous level
            for parent_id in nodes_by_level[level - 1]:
                parent_node = self.guidance.job_roles[parent_id]
                parent_skills = set(parent_node.get("required_skills", []))
                parent_paths = set(parent_node.get("career_paths", []))
                
                # Find related roles
                for related_id, related_role in self.guidance.job_roles.items():
                    if related_id in processed_nodes:
                        continue
                    
                    related_skills = set(related_role.get("required_skills", []))
                    related_paths = set(related_role.get("career_paths", []))
                    
                    # Check skill overlap
                    skill_overlap = len(parent_skills.intersection(related_skills))
                    path_overlap = len(parent_paths.intersection(related_paths))
                    
                    # Add node if there's significant overlap
                    if skill_overlap >= 2 or path_overlap >= 1:
                        G.add_node(related_id, 
                                  title=related_role.get("title", related_id),
                                  level=level,
                                  type="related",
                                  skills=related_role.get("required_skills", []))
                        
                        # Add edge between parent and related node
                        weight = skill_overlap + (path_overlap * 2)
                        G.add_edge(parent_id, related_id, weight=weight)
                        
                        processed_nodes.add(related_id)
                        nodes_by_level[level].append(related_id)
        
        # Convert NetworkX graph to a suitable format for visualization
        nodes = []
        for node_id in G.nodes:
            node_data = G.nodes[node_id]
            nodes.append({
                "id": node_id,
                "label": node_data.get("title", node_id),
                "level": node_data.get("level", 0),
                "type": node_data.get("type", "related"),
                "skills": node_data.get("skills", [])
            })
        
        edges = []
        for source, target, data in G.edges(data=True):
            edges.append({
                "source": source,
                "target": target,
                "weight": data.get("weight", 1)
            })
        
        return {
            "current_role": current_role,
            "nodes": nodes,
            "edges": edges,
            "levels": depth,
            "visualization_type": "career_network"
        }
    
    def generate_skill_relationship_data(self, skills: List[str], 
                                        skill_matrix: Optional[Dict[str, Dict[str, float]]] = None) -> Dict[str, Any]:
        """
        Generate data visualizing relationships between skills
        
        Args:
            skills: List of skills to visualize
            skill_matrix: Optional custom skill relationship matrix
            
        Returns:
            dict: Skill relationship visualization data
        """
        # Use provided skill matrix or the one from guidance
        matrix = skill_matrix if skill_matrix else self.guidance.skill_matrix
        
        # Normalize skills to lowercase for matching
        skills_lower = [s.lower() for s in skills]
        
        # Create nodes for each skill
        nodes = []
        for i, skill in enumerate(skills):
            nodes.append({
                "id": f"skill_{i}",
                "label": skill,
                "group": 1,  # All user skills in the same group
                "type": "user_skill"
            })
        
        # Find related skills from the matrix
        related_skills = set()
        for skill in skills_lower:
            if skill in matrix:
                for related, strength in matrix[skill].items():
                    if related not in skills_lower and strength >= 0.5:
                        related_skills.add(related)
        
        # Add nodes for related skills
        for i, skill in enumerate(related_skills):
            nodes.append({
                "id": f"related_{i}",
                "label": skill,
                "group": 2,  # Related skills in a different group
                "type": "related_skill"
            })
        
        # Create edges between skills
        edges = []
        
        # Connect user skills based on matrix
        for i, skill1 in enumerate(skills_lower):
            for j, skill2 in enumerate(skills_lower):
                if i != j:
                    # Check if relation exists in matrix
                    strength = 0
                    if skill1 in matrix and skill2 in matrix[skill1]:
                        strength = matrix[skill1][skill2]
                    elif skill2 in matrix and skill1 in matrix[skill2]:
                        strength = matrix[skill2][skill1]
                    
                    if strength >= 0.3:  # Only connect if there's a meaningful relationship
                        edges.append({
                            "source": f"skill_{i}",
                            "target": f"skill_{j}",
                            "value": strength,
                            "type": "user_to_user"
                        })
        
        # Connect user skills to related skills
        for i, skill1 in enumerate(skills_lower):
            if skill1 in matrix:
                for j, skill2 in enumerate(related_skills):
                    if skill2 in matrix[skill1]:
                        strength = matrix[skill1][skill2]
                        if strength >= 0.5:  # Stronger threshold for extended relations
                            edges.append({
                                "source": f"skill_{i}",
                                "target": f"related_{j}",
                                "value": strength,
                                "type": "user_to_related"
                            })
        
        return {
            "nodes": nodes,
            "edges": edges,
            "visualization_type": "skill_network"
        }
    
    def create_path_comparison_data(self, career_paths: List[str], current_skills: List[str]) -> Dict[str, Any]:
        """
        Create data for comparing multiple career paths
        
        Args:
            career_paths: List of career path IDs to compare
            current_skills: List of user's current skills
            
        Returns:
            dict: Comparison visualization data
        """
        comparison_data = {
            "paths": [],
            "metrics": ["skill_match", "growth_potential", "stability", "salary_range"],
            "visualization_type": "career_comparison"
        }
        
        # Process each career path
        for path_id in career_paths:
            # Skip if path doesn't exist
            if path_id not in self.guidance.career_paths:
                continue
                
            path_data = self.guidance.career_paths[path_id]
            progression = path_data.get("progression", [])
            
            if not progression:
                continue
                
            # Calculate skill match percentage
            total_required = 0
            total_matched = 0
            
            for level in progression:
                key_skills = [s.lower() for s in level.get("key_skills", [])]
                total_required += len(key_skills)
                
                for skill in key_skills:
                    if skill in [s.lower() for s in current_skills]:
                        total_matched += 1
            
            skill_match = (total_matched / total_required * 100) if total_required > 0 else 0
            
            # Determine other metrics
            # These would normally be based on real data, but we'll use placeholders
            growth_potential = random.uniform(60, 95)  # Placeholder
            stability = random.uniform(50, 95)  # Placeholder
            
            # Get salary range from the highest level
            if progression:
                highest_level = progression[-1]
                salary_min = highest_level.get("salary_range", {}).get("min", 0)
                salary_max = highest_level.get("salary_range", {}).get("max", 0)
            else:
                salary_min = 0
                salary_max = 0
            
            # Create path data object
            path_obj = {
                "id": path_id,
                "name": path_data.get("title", path_id),
                "levels": len(progression),
                "metrics": {
                    "skill_match": round(skill_match, 1),
                    "growth_potential": round(growth_potential, 1),
                    "stability": round(stability, 1),
                    "salary_range": [salary_min, salary_max]
                },
                "progression": []
            }
            
            # Add summary of progression
            for level in progression:
                path_obj["progression"].append({
                    "title": level.get("title", ""),
                    "years_experience": level.get("years_experience", ""),
                    "key_skills": level.get("key_skills", [])
                })
            
            comparison_data["paths"].append(path_obj)
        
        return comparison_data
    
    def save_visualization_as_image(self, data: Dict[str, Any], filename: str) -> Dict[str, Any]:
        """
        Generate and save a visualization as an image
        
        Args:
            data: Visualization data structure
            filename: Base filename for the saved image
            
        Returns:
            dict: Result with file path if successful
        """
        if not MATPLOTLIB_AVAILABLE:
            return {"error": "Matplotlib not available", "success": False, "file_path": None}
        
        viz_type = data.get("visualization_type", "")
        
        try:
            plt.figure(figsize=(12, 8))
            
            if viz_type == "career_progression":
                # Create a simple progression chart
                levels = data.get("levels", [])
                x = range(len(levels))
                
                # Get current level
                current_level = data.get("current_level", 1) - 1
                colors = ['gray'] * len(levels)
                if 0 <= current_level < len(colors):
                    colors[current_level] = 'blue'
                
                # Create the plot
                plt.bar(x, [1] * len(levels), color=colors, width=0.6)
                plt.xticks(x, [level.get("title", f"Level {i+1}") for i, level in enumerate(levels)])
                plt.title(f"Career Progression: {data.get('career_path', 'Unknown Path')}")
                plt.ylabel("Progress")
                plt.grid(axis='y', linestyle='--', alpha=0.7)
                
                # Add annotations
                for i, level in enumerate(levels):
                    plt.text(i, 0.5, f"Experience: {level.get('years_experience', 'N/A')}", 
                             ha='center', va='center', rotation=90, color='white')
            
            elif viz_type == "skill_network":
                if not NETWORKX_AVAILABLE:
                    return {"error": "NetworkX not available", "success": False, "file_path": None}
                
                # Create a graph from the data
                G = nx.Graph()
                for node in data.get("nodes", []):
                    G.add_node(node["id"], label=node["label"], group=node.get("group", 1))
                
                for edge in data.get("edges", []):
                    G.add_edge(edge["source"], edge["target"], weight=edge.get("value", 1))
                
                # Create layout
                pos = nx.spring_layout(G, k=0.15, iterations=50)
                
                # Draw nodes
                user_nodes = [n for n in G.nodes() if n.startswith("skill_")]
                related_nodes = [n for n in G.nodes() if n.startswith("related_")]
                
                nx.draw_networkx_nodes(G, pos, nodelist=user_nodes, node_color='royalblue', node_size=500, alpha=0.8)
                nx.draw_networkx_nodes(G, pos, nodelist=related_nodes, node_color='lightgreen', node_size=300, alpha=0.6)
                
                # Draw edges with varying width based on weight
                for (u, v, d) in G.edges(data=True):
                    weight = d.get('weight', 1)
                    nx.draw_networkx_edges(G, pos, edgelist=[(u, v)], width=weight*2, alpha=0.6)
                
                # Add labels
                labels = {node: G.nodes[node]["label"] for node in G.nodes()}
                nx.draw_networkx_labels(G, pos, labels, font_size=8)
                
                plt.title("Skill Relationship Network")
                plt.axis('off')
            
            elif viz_type == "career_comparison":
                # Create a radar chart for comparing career paths
                paths = data.get("paths", [])
                metrics = data.get("metrics", [])
                
                if not paths or not metrics:
                    return {"error": "Invalid comparison data", "success": False, "file_path": None}
                
                # Prepare data for radar chart
                angles = np.linspace(0, 2*np.pi, len(metrics), endpoint=False).tolist()
                angles += angles[:1]  # Close the polygon
                
                # Create the figure
                fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))
                
                # Plot each career path
                for i, path in enumerate(paths):
                    values = [path["metrics"].get(m, 0) for m in metrics]
                    
                    # Handle salary range differently
                    for j, m in enumerate(metrics):
                        if m == "salary_range" and isinstance(values[j], list) and len(values[j]) == 2:
                            # Convert to single value - use percentage of max possible
                            max_possible = 200000  # Example max salary
                            values[j] = (values[j][0] + values[j][1]) / 2 / max_possible * 100
                    
                    values += values[:1]  # Close the polygon
                    
                    # Plot
                    color = DEFAULT_CHART_COLORS[i % len(DEFAULT_CHART_COLORS)]
                    ax.plot(angles, values, linewidth=2, linestyle='solid', label=path["name"], color=color)
                    ax.fill(angles, values, alpha=0.1, color=color)
                
                # Set labels and legend
                ax.set_thetagrids(np.degrees(angles[:-1]), metrics)
                ax.set_ylim(0, 100)
                ax.grid(True)
                ax.legend(loc='upper right', bbox_to_anchor=(0.1, 0.1))
                plt.title("Career Path Comparison")
            
            # Save the figure
            file_path = os.path.join(self.output_dir, f"{filename}.png")
            plt.savefig(file_path, bbox_inches='tight', dpi=150)
            plt.close()
            
            return {
                "success": True,
                "file_path": file_path,
                "visualization_type": viz_type
            }
            
        except Exception as e:
            print(f"Error creating visualization: {e}")
            return {"error": str(e), "success": False, "file_path": None}


# Standalone functions for career path visualization

def visualize_career_path(current_role: str, career_path_id: str, 
                         current_skills: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Generate career path visualization data
    
    Args:
        current_role: Current job role title
        career_path_id: Career path to visualize
        current_skills: List of user's current skills (optional)
        
    Returns:
        dict: Visualization data
    """
    visualizer = CareerPathVisualizer()
    return visualizer.generate_career_progression_data(current_role, career_path_id, current_skills)


def visualize_related_careers(current_role: str, depth: int = 2) -> Dict[str, Any]:
    """
    Generate visualization of related career options
    
    Args:
        current_role: Current job role title
        depth: Degree of relationship to include
        
    Returns:
        dict: Visualization data
    """
    visualizer = CareerPathVisualizer()
    return visualizer.create_career_graph_data(current_role, depth)


def compare_career_paths(paths: List[str], skills: List[str]) -> Dict[str, Any]:
    """
    Generate comparison data for multiple career paths
    
    Args:
        paths: List of career path IDs to compare
        skills: User's current skills
        
    Returns:
        dict: Comparison data
    """
    visualizer = CareerPathVisualizer()
    return visualizer.create_path_comparison_data(paths, skills)
