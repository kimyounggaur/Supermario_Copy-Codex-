export type Palette = {
  block: {
    base: string;
    light: string;
    lighter: string;
    dark: string;
    darker: string;
    rivet: string;
  };
  brick: {
    base: string;
    light: string;
    dark: string;
    mortar: string;
  };
  ground: {
    base: string;
    light: string;
    dark: string;
    darker: string;
    grass: string;
    grassLight: string;
    grassDark: string;
    speckLight: string;
    speckDark: string;
  };
  cloud: {
    base: string;
    light: string;
    shade: string;
    edge: string;
  };
  pipe: {
    darkest: string;
    dark: string;
    base: string;
    light: string;
    specular: string;
  };
  mushroom: {
    capBase: string;
    capLight: string;
    capDark: string;
    spot: string;
    stem: string;
    stemShade: string;
    eye: string;
  };
  flower: {
    outer: string;
    outerLight: string;
    outerDark: string;
    mid: string;
    face: string;
    stem: string;
    leaf: string;
    leafDark: string;
  };
  coin: {
    base: string;
    light: string;
    dark: string;
    rim: string;
    glint: string;
  };
  creature: {
    body: string;
    light: string;
    dark: string;
    belly: string;
    eye: string;
    brow: string;
  };
  ui: {
    panel: string;
    panelBorder: string;
    action: string;
    actionLight: string;
    actionDark: string;
    danger: string;
    focus: string;
  };
  sky: {
    top: string;
    bottom: string;
    hill: string;
    hillLight: string;
  };
};

export type PaletteOverride = {
  [Key in keyof Palette]?: Partial<Palette[Key]>;
};

export type ThemeId = 'overworld' | 'underground' | 'castle' | 'snow';

export const PALETTE: Palette = {
  block: {
    base: '#F9A825',
    light: '#FFD23E',
    lighter: '#FFF3C2',
    dark: '#E08900',
    darker: '#B36A00',
    rivet: '#4A2E00'
  },
  brick: {
    base: '#C45A2A',
    light: '#E8966B',
    dark: '#8C3D1B',
    mortar: '#3B1F0E'
  },
  ground: {
    base: '#C8854A',
    light: '#DDA56B',
    dark: '#A05E2C',
    darker: '#8A4E22',
    grass: '#58C431',
    grassLight: '#9BE86B',
    grassDark: '#2E9418',
    speckLight: '#DDA56B',
    speckDark: '#8A4E22'
  },
  cloud: {
    base: '#F7FBFF',
    light: '#FFFFFF',
    shade: '#DCEFFF',
    edge: '#A7D8EA'
  },
  pipe: {
    darkest: '#0A4A0A',
    dark: '#157A1F',
    base: '#36B24A',
    light: '#7DDB7D',
    specular: '#C8F5B8'
  },
  mushroom: {
    capBase: '#E60012',
    capLight: '#FF8A7A',
    capDark: '#8F0008',
    spot: '#FFFFFF',
    stem: '#FFE6B8',
    stemShade: '#E8C088',
    eye: '#2E1A0A'
  },
  flower: {
    outer: '#F1320E',
    outerLight: '#FF7A4D',
    outerDark: '#B71C0C',
    mid: '#FFD500',
    face: '#F4FBFF',
    stem: '#2E9E32',
    leaf: '#45C24A',
    leafDark: '#1F8A24'
  },
  coin: {
    base: '#F4B400',
    light: '#FFE36B',
    dark: '#C8860B',
    rim: '#B8780A',
    glint: '#FFF2B0'
  },
  creature: {
    body: '#9C5A24',
    light: '#C98445',
    dark: '#6E3D14',
    belly: '#F2DCB8',
    eye: '#2E1A0A',
    brow: '#1A0F05'
  },
  ui: {
    panel: '#FFF9EC',
    panelBorder: '#E8D9B0',
    action: '#F9A825',
    actionLight: '#FFD23E',
    actionDark: '#C77400',
    danger: '#E84B3C',
    focus: '#B36A00'
  },
  sky: {
    top: '#8ECBFF',
    bottom: '#CDEBFF',
    hill: '#87CC78',
    hillLight: '#B8EA8D'
  }
};

export const THEMES: Record<ThemeId, { label: string; palette: PaletteOverride }> = {
  overworld: {
    label: 'Overworld',
    palette: {}
  },
  underground: {
    label: 'Underground',
    palette: {
      sky: { top: '#0A0A14', bottom: '#16162A', hill: '#2A3564', hillLight: '#4E629A' },
      block: {
        base: '#3E7EC0',
        light: '#6FAAE0',
        lighter: '#CFE7FF',
        dark: '#2A5A92',
        darker: '#173D6B'
      },
      ground: {
        base: '#4D8A8A',
        light: '#7CC9C1',
        dark: '#326767',
        darker: '#214D52',
        grass: '#58B7C8',
        grassLight: '#99E9F0',
        grassDark: '#2A7D88'
      }
    }
  },
  castle: {
    label: 'Castle',
    palette: {
      sky: { top: '#1A0E0E', bottom: '#2E1414', hill: '#493036', hillLight: '#7B5052' },
      ground: {
        base: '#787878',
        light: '#A0A0A0',
        dark: '#4E4E4E',
        darker: '#333333',
        grass: '#D96A2E',
        grassLight: '#FFA14E',
        grassDark: '#A53E1E'
      },
      block: {
        base: '#8A6A52',
        light: '#BA9172',
        lighter: '#E3C3A6',
        dark: '#5F4639',
        darker: '#3E2C26'
      }
    }
  },
  snow: {
    label: 'Snow',
    palette: {
      sky: { top: '#BFEAFF', bottom: '#F3FBFF', hill: '#D8ECF8', hillLight: '#FFFFFF' },
      ground: {
        base: '#B9D4E2',
        light: '#FFFFFF',
        dark: '#85A8BC',
        darker: '#5E8196',
        grass: '#FFFFFF',
        grassLight: '#FFFFFF',
        grassDark: '#D8ECF8'
      },
      cloud: {
        base: '#FFFFFF',
        shade: '#D8ECF8',
        edge: '#B9D4E2'
      }
    }
  }
};

export function mergePalette(base: Palette, override: PaletteOverride = {}): Palette {
  return {
    block: { ...base.block, ...override.block },
    brick: { ...base.brick, ...override.brick },
    ground: { ...base.ground, ...override.ground },
    cloud: { ...base.cloud, ...override.cloud },
    pipe: { ...base.pipe, ...override.pipe },
    mushroom: { ...base.mushroom, ...override.mushroom },
    flower: { ...base.flower, ...override.flower },
    coin: { ...base.coin, ...override.coin },
    creature: { ...base.creature, ...override.creature },
    ui: { ...base.ui, ...override.ui },
    sky: { ...base.sky, ...override.sky }
  };
}
