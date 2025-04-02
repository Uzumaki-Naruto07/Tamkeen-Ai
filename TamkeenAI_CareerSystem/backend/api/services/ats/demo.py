#!/usr/bin/env python3
"""
ATS Analyzer Demo Script

This script demonstrates how to use the ATS analyzer system directly,
without going through the API endpoints.
"""

import os
import sys
import json
import argparse
from typing import Dict, Any, Optional

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..')))

# Import the ATS analyzer components
from api.services.ats.ats_analyzer import create_ats_analyzer
from api.services.ats.resume_extractor import extract_text_from_resume, extract_sections_from_resume
from api.services.ats.keyword_extractor import extract_keywords_advanced, find_matching_keywords

# Import sample job descriptions
from api.utils.sample_jobs import sample_job_descriptions


def analyze_resume(resume_path: str, job_title: Optional[str] = None, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze a resume file against a job description
    
    Args:
        resume_path: Path to the resume file (PDF, DOCX, TXT)
        job_title: Title of the job to match against (uses sample job descriptions)
        api_key: Optional DeepSeek API key for AI-powered analysis
        
    Returns:
        Dictionary with analysis results
    """
    # Validate the resume file exists
    if not os.path.exists(resume_path):
        print(f"Error: Resume file '{resume_path}' not found.")
        return {"error": f"Resume file not found: {resume_path}"}
    
    # Get job description if title provided
    job_description = ""
    if job_title:
        # Find exact or fuzzy match in sample jobs
        if job_title in sample_job_descriptions:
            job_description = sample_job_descriptions[job_title]
        else:
            # Try to find a fuzzy match
            for title, desc in sample_job_descriptions.items():
                if job_title.lower() in title.lower() or title.lower() in job_title.lower():
                    job_description = desc
                    job_title = title
                    print(f"Using job description for '{title}'")
                    break
            
            if not job_description:
                print(f"Warning: Job title '{job_title}' not found in sample descriptions.")
                print(f"Available job titles: {', '.join(sample_job_descriptions.keys())}")
                print("Continuing with format analysis only...")
    
    # Create ATS analyzer with optional API key
    analyzer = create_ats_analyzer(api_key=api_key)
    
    # Analyze the resume
    print(f"Analyzing resume: {resume_path}")
    if job_description:
        print(f"Matching against job: {job_title}")
    else:
        print("Performing format analysis only (no job matching)")
    
    # Run the analysis
    results = analyzer.analyze_resume(
        resume_path=resume_path,
        job_description=job_description,
        job_title=job_title,
        use_semantic_matching=True,
        use_contextual_analysis=True,
        use_deepseek=bool(api_key)
    )
    
    return results


def print_results(results: Dict[str, Any]) -> None:
    """
    Print analysis results in a user-friendly format
    
    Args:
        results: Analysis results dictionary
    """
    if not results.get("success", False):
        print(f"Error: {results.get('error', 'Unknown error')}")
        return
    
    print("\n" + "="*80)
    print(f"ATS ANALYSIS RESULTS".center(80))
    print("="*80 + "\n")
    
    # Print overall score and assessment
    print(f"Overall Score: {results.get('score', 0)}/100")
    print(f"Assessment: {results.get('assessment', 'No assessment available')}")
    print("\n" + "-"*80 + "\n")
    
    # Print format analysis
    format_analysis = results.get("format_analysis", {})
    print("FORMAT ANALYSIS:")
    print(f"File Format: {format_analysis.get('file_format', 'Unknown')}")
    print(f"Format Score: {format_analysis.get('format_score', 0)}/100")
    
    format_issues = format_analysis.get("format_issues", [])
    if format_issues:
        print("Issues:")
        for issue in format_issues:
            print(f"  - {issue}")
    print("\n" + "-"*80 + "\n")
    
    # Print keyword analysis if available
    matching_keywords = results.get("matching_keywords", [])
    missing_keywords = results.get("missing_keywords", [])
    
    if matching_keywords or missing_keywords:
        print("KEYWORD ANALYSIS:")
        print(f"Matching Keywords ({len(matching_keywords)}): {', '.join(matching_keywords[:10])}")
        if len(matching_keywords) > 10:
            print(f"  ... and {len(matching_keywords) - 10} more")
        
        print(f"Missing Keywords ({len(missing_keywords)}): {', '.join(missing_keywords[:10])}")
        if len(missing_keywords) > 10:
            print(f"  ... and {len(missing_keywords) - 10} more")
        print("\n" + "-"*80 + "\n")
    
    # Print section analysis if available
    sections_analysis = results.get("sections_analysis", {})
    if sections_analysis:
        print("SECTION ANALYSIS:")
        for section, analysis in sections_analysis.items():
            if isinstance(analysis, dict):
                print(f"{section.upper()}:")
                if "completeness" in analysis:
                    print(f"  Completeness: {analysis.get('completeness', 0)}/100")
                if "relevance" in analysis:
                    print(f"  Relevance: {analysis.get('relevance', 0)}/100")
                if "word_count" in analysis:
                    print(f"  Word Count: {analysis.get('word_count', 0)}")
                
                recommendations = analysis.get("recommendations", [])
                if recommendations:
                    print("  Recommendations:")
                    for rec in recommendations:
                        print(f"    - {rec}")
        
        # Print missing sections if available
        missing_sections = sections_analysis.get("missing_essential_sections", [])
        if missing_sections:
            print("\nMISSING ESSENTIAL SECTIONS:")
            for section in missing_sections:
                print(f"  - {section}")
        
        missing_recommended = sections_analysis.get("missing_recommended_sections", [])
        if missing_recommended:
            print("\nMISSING RECOMMENDED SECTIONS:")
            for section in missing_recommended:
                print(f"  - {section}")
        
        print("\n" + "-"*80 + "\n")
    
    # Print recommendations
    recommendations = results.get("recommendations", [])
    if recommendations:
        print("RECOMMENDATIONS:")
        for i, rec in enumerate(recommendations, 1):
            print(f"{i}. {rec}")
        print("\n" + "-"*80 + "\n")
    
    # Print DeepSeek analysis if available
    llm_analysis = results.get("llm_analysis", "")
    if llm_analysis and llm_analysis != "LLM analysis unavailable - DeepSeek client not initialized":
        print("DEEPSEEK AI ANALYSIS:")
        print(llm_analysis)
        print("\n" + "-"*80 + "\n")
    
    # Print improvement roadmap if available
    roadmap = results.get("improvement_roadmap", "")
    if roadmap and roadmap != "Improvement roadmap unavailable - DeepSeek client not initialized":
        print("IMPROVEMENT ROADMAP:")
        print(roadmap)
        print("\n" + "-"*80 + "\n")


def main():
    """Main function to run the demo"""
    parser = argparse.ArgumentParser(description='ATS Analyzer Demo')
    parser.add_argument('resume', help='Path to resume file (PDF, DOCX, or TXT)')
    parser.add_argument('--job', '-j', dest='job_title', help='Job title to match against')
    parser.add_argument('--api-key', '-k', dest='api_key', help='DeepSeek API key for AI analysis')
    parser.add_argument('--output', '-o', dest='output_file', help='Save results to JSON file')
    parser.add_argument('--list-jobs', '-l', action='store_true', help='List available sample job titles')
    
    args = parser.parse_args()
    
    # List available jobs if requested
    if args.list_jobs:
        print("Available job titles:")
        for title in sorted(sample_job_descriptions.keys()):
            print(f"  - {title}")
        return
    
    # Check for API key in environment if not provided
    api_key = args.api_key
    if not api_key:
        api_key = os.environ.get('DEEPSEEK_API_KEY', None)
        if api_key:
            print("Using DeepSeek API key from environment variable")
    
    # Analyze resume
    results = analyze_resume(
        resume_path=args.resume,
        job_title=args.job_title,
        api_key=api_key
    )
    
    # Save results to file if requested
    if args.output_file:
        try:
            with open(args.output_file, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"Results saved to {args.output_file}")
        except Exception as e:
            print(f"Error saving results to file: {str(e)}")
    
    # Print results
    print_results(results)


if __name__ == "__main__":
    main() 