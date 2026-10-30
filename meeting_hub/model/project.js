/**
 * Project Model & Configuration Schema
 * 
 * Defines the generic project contract and validation helpers.
 * Note: Hardcoded projects have been deprecated in favor of the Missions System of Record.
 * Legacy project constants are preserved in meeting_hub/_deprecated/project.js.
 */

export const DEFAULT_PROJECTS = [];

export class ProjectModel {
  static createDefault(name, clientMatch = []) {
    const slug = (name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const clientList = clientMatch.length > 0 ? clientMatch : [name];
    return {
      id: slug || `proj-${Date.now()}`,
      name: name || 'New Project',
      clientMatch: clientList,
      docSources: [],
      workstreams: [],
      parserHints: {
        tools: [],
        concepts: [],
        facilities: [],
        decisionTriggers: [],
        tagRules: [],
        ownerOrgRules: []
      }
    };
  }

  static validate(project) {
    if (!project || typeof project !== 'object') return false;
    if (!project.id || typeof project.id !== 'string') return false;
    if (!project.name || typeof project.name !== 'string') return false;
    if (!Array.isArray(project.clientMatch)) project.clientMatch = [];
    if (!Array.isArray(project.docSources)) project.docSources = [];
    if (!Array.isArray(project.workstreams)) project.workstreams = [];
    if (!project.parserHints || typeof project.parserHints !== 'object') {
      project.parserHints = {
        tools: [],
        concepts: [],
        facilities: [],
        decisionTriggers: [],
        tagRules: [],
        ownerOrgRules: []
      };
    }
    return true;
  }
}
