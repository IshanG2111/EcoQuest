import { EcoGraphEngine } from './engine';
import { DynamicQuest, EcoNode } from './types';

export class EcoGraphQuestEngine {
  private engine: EcoGraphEngine;

  constructor() {
    this.engine = EcoGraphEngine.getInstance();
  }

  /**
   * Generates dynamic quests based on active knowledge graph entities
   */
  public generatePersonalizedQuests(exploredNodeIds: string[] = []): DynamicQuest[] {
    const allNodes = this.engine.getAllNodes();
    const quests: DynamicQuest[] = [];

    // Quest 1: Bengal Tiger Conservation Quest
    const tigerNode = this.engine.getNode('species-bengal-tiger');
    if (tigerNode) {
      const tigerNeighborhood = this.engine.getNeighborhood(tigerNode.id, 2);
      quests.push({
        id: 'quest-tiger-sundarbans',
        title: 'Project Tiger: Apex Guardian Mission',
        description: 'Explore the relationship between the Bengal Tiger, its Sundarbans mangrove habitat, and sea level rise threats.',
        targetNodeId: tigerNode.id,
        requiredPathIds: tigerNeighborhood.nodes.map((n) => n.id),
        xpReward: 150,
        difficulty: 'Medium',
        badgeReward: '🐅 Apex Guardian',
        category: 'Biodiversity',
        isCompleted: exploredNodeIds.includes(tigerNode.id),
      });
    }

    // Quest 2: Clean Air NCAP Quest
    const pm25Node = this.engine.getNode('pollutant-pm25');
    if (pm25Node) {
      const pm25Neighborhood = this.engine.getNeighborhood(pm25Node.id, 2);
      quests.push({
        id: 'quest-clean-air-ncap',
        title: 'Urban Air Quality Sentinel',
        description: 'Trace how agricultural stubble burning feeds PM2.5 pollution and evaluate the National Clean Air Programme (NCAP) policy.',
        targetNodeId: pm25Node.id,
        requiredPathIds: pm25Neighborhood.nodes.map((n) => n.id),
        xpReward: 200,
        difficulty: 'Hard',
        badgeReward: '💨 Air Quality Sentinel',
        category: 'Pollution',
        isCompleted: exploredNodeIds.includes(pm25Node.id),
      });
    }

    // Quest 3: Western Ghats Biodiversity Hotspot
    const ghatsNode = this.engine.getNode('habitat-western-ghats');
    if (ghatsNode) {
      quests.push({
        id: 'quest-western-ghats',
        title: 'Western Ghats Bio-Expedition',
        description: 'Discover endemic flora and fauna species protected within the high-elevation montane rainforests of South India.',
        targetNodeId: ghatsNode.id,
        requiredPathIds: [ghatsNode.id],
        xpReward: 100,
        difficulty: 'Easy',
        badgeReward: '⛰️ Hotspot Explorer',
        category: 'Spatial',
        isCompleted: exploredNodeIds.includes(ghatsNode.id),
      });
    }

    // Quest 4: Ganges River Dolphin Freshwater Rescue
    const dolphinNode = this.engine.getNode('species-ganges-dolphin');
    if (dolphinNode) {
      quests.push({
        id: 'quest-ganges-dolphin',
        title: 'Freshwater Dolphin Eco-Audit',
        description: 'Analyze river pollution impacts on the endangered Ganges River Dolphin population in deep river pools.',
        targetNodeId: dolphinNode.id,
        requiredPathIds: [dolphinNode.id],
        xpReward: 125,
        difficulty: 'Medium',
        badgeReward: '🐬 River Guardian',
        category: 'Biodiversity',
        isCompleted: exploredNodeIds.includes(dolphinNode.id),
      });
    }

    return quests;
  }

  public completeQuest(questId: string, userXP: number = 0): { success: boolean; newXP: number; badgeAwarded?: string } {
    const quests = this.generatePersonalizedQuests();
    const quest = quests.find((q) => q.id === questId);
    if (!quest) {
      return { success: false, newXP: userXP };
    }

    return {
      success: true,
      newXP: userXP + quest.xpReward,
      badgeAwarded: quest.badgeReward,
    };
  }
}
