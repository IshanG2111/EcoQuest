import { animate as animeAnimate } from 'animejs';

export interface AnimeParams {
  targets?: any;
  duration?: number;
  delay?: number | ((el: any, i: number) => number);
  easing?: string;
  opacity?: any;
  scale?: any;
  translateY?: any;
  translateX?: any;
  filter?: any;
  complete?: (anim?: any) => void;
  [key: string]: any;
}

export function anime(params: AnimeParams) {
  try {
    if (typeof animeAnimate === 'function') {
      const { complete, ...rest } = params;
      const animationOptions: Record<string, any> = { ...rest };
      if (complete) {
        animationOptions.onComplete = complete;
      }
      const instance = (animeAnimate as any)(params.targets, animationOptions);
      return instance;
    }
  } catch (e) {
    if (params.complete) {
      setTimeout(params.complete, params.duration || 200);
    }
  }
  return null;
}

export default anime;
