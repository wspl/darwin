import { spawn, spawnSync } from "child_process";
import fs from 'fs'
import path from "path";
import { Readable } from "stream";
import lodash from 'lodash'

async function main() {
  const [framework, ident, filter] = process.argv.slice(2)
  const [data, ast] = await searchIdent(framework, ident)

  if (data.methods.length > 0) {
    console.log('methods:')
    console.log(genMethods(data.methods, ast, ident, filter))
    console.log('')
  }
  
  if (data.properties.length > 0) {
    console.log('properties:')
    console.log(genProperties(data.properties, ast, ident, filter))
    console.log('')
  }

  if (data.enums.length > 0) {
    console.log('enum:')
    console.log(genEnum(data.enums, ast, ident))
    console.log('')
  }
  
  if (data.struct.length > 0) {
    console.log('struct:')
    console.log(genStruct(data.struct, ast, ident))
    console.log('')
  }
}

main()

function streamToString (stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  })
}

async function getAST(framework: string) {
  const cachePath = path.resolve('node_modules/.generate_cache')
  fs.mkdirSync(cachePath, { recursive: true })
  const cacheFile = path.resolve(cachePath, `${framework}.ast.cache`)
  const cache = fs.existsSync(cacheFile)

  if (cache) {
    console.log('cache is detected, using cache...\n')
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
  } else {
    console.log('no cache found, parse headers...\n')
  }

  const proc = spawn('clang', [
    '-x',
    'objective-c',
    '-Xclang',
    '-ast-dump=json',
    '-'
  ])
  proc.stdin.write(`#include<${framework}/${framework}.h>\n`)
  // proc.stdin.write(`#include<Foundation/NSString.h>\n`)
  proc.stdin.end()
  const data = await streamToString(proc.stdout)
  fs.writeFileSync(cacheFile, data)
  return JSON.parse(data)
}

async function searchIdent(framework: string, ident: string) {
  const ast = await getAST(framework)
  const items = ast.inner.filter((t: any) => t.name === ident || t.interface?.name === ident)
  // fs.writeFileSync('./filtered.json', JSON.stringify(items))
  
  const methods: any[] = []
  const properties: any[] = []
  const enums: any[] = []
  const struct: any[] = []

  items.forEach((decl: any) => {
    if ((decl.name === ident || decl.interface?.name === ident) && decl.inner) {
      decl.inner.filter((t: any) => t.kind === 'ObjCMethodDecl').forEach((t: any) => {
        methods.push({
          name: t.name,
          returnType: t.returnType,
          params: t.inner?.filter((t: any) => t.kind === 'ParmVarDecl').map((t: any) => {
            return {
              name: t.name,
              type: t.type
            }
          }) ?? [],
          extension: decl.name,
          deprecated: t.inner?.some((t: any) => {
            return t.kind === 'AvailabilityAttr' &&
              fs.readFileSync(t.range.begin.expansionLoc.file, 'utf-8')
                .split('\n')[t.range.begin.expansionLoc.line - 1]
                .slice(t.range.begin.expansionLoc.col - 1, t.range.begin.expansionLoc.col + t.range.begin.expansionLoc.tokLen - 1)
              === 'API_DEPRECATED'
          }) ?? false,
          static: t.instance === false
        })   
      })

      decl.inner.filter((t: any) => t.kind === 'ObjCPropertyDecl').forEach((t: any) => {
        properties.push({
          name: t.name,
          type: t.type,
          readonly: t.readonly,
          deprecated: t.inner?.some((t: any) => {
            return t.kind === 'AvailabilityAttr' &&
              fs.readFileSync(t.range.begin.expansionLoc.file, 'utf-8')
                .split('\n')[t.range.begin.expansionLoc.line - 1]
                .slice(t.range.begin.expansionLoc.col - 1, t.range.begin.expansionLoc.col + t.range.begin.expansionLoc.tokLen - 1)
              === 'API_DEPRECATED'
          }) ?? false,
          static: t.class
        })
      })

      if (decl.kind === 'EnumDecl') {
        const type = decl.fixedUnderlyingType
        decl.inner.filter((t: any) => t.kind === 'EnumConstantDecl').forEach((t: any, index: number) => {
          enums.push({
            name: t.name,
            type,
            value: t.inner[0].value ?? t.inner[0].inner?.[0].value ?? index,
          })
        })
      }

      if (decl.kind === 'RecordDecl' && decl.tagUsed === 'struct') {
        decl.inner.filter((t: any) => t.kind === 'FieldDecl').forEach((t: any) => {
          struct.push({
            name: t.name,
            type: t.type
          })
        })
      }
    }
  })

  return [{
    enums,
    methods,
    properties,
    struct
  }, ast]
}

function genEnum(enums: any[], ast: any, ident: string) {
  const words: string[][] = enums.map((t: any) => lodash.startCase(t.name).split(' '))
  let i = 0
  let repeat = -1
  while (true) {
    const t = words.map(t => t[i])
    if (t.every(v => v === t[0])) {
      repeat = i
    } else {
      break
    }
    i++
    if (!words[0][i]) {
      break
    }
  }
  const prefix = words[0].slice(0, repeat + 1).reduce((a, t) => a + t.length, 0)
  
  const values = enums.map((t: any, i: number) => {
    const name = lodash.camelCase(t.name.slice(prefix))
    let valueExp = ''
    switch (t.type.desugaredQualType) {
      case 'long':
      case 'unsigned long': {
        valueExp = `${t.value}n`
        break
      }
      default: {
        console.log(t.type)
        throw 'unknown type'
      }
    }
    return `  ${name}: ${valueExp},`
  }).join('\n')
  return `export const ${ident} = {
${values}
} as const
export type ${ident} = (typeof ${ident})[keyof typeof ${ident}]`
}

function genMethods(methods: any[], ast: any, ident: string, filter: string) {
  return methods.filter((t: any) => !t.deprecated && (filter ? t.name.includes(filter) : true)).map(t => {
    const msgs = t.name.split(':').filter((t: string) => t.length > 0)
    const methodName = msgs.join('_')

    const args = t.params.map((t: any) => astTypeToTSType(t.type, ast))
    const ret = astTypeToTSType(t.returnType, ast)
  
    const msgSendExp = `msgSend(${t.static ? `getClass('${ident}')` : 'this._id'}, ${
      t.params.length === 0 ?
        `'${t.name}'` :
        `{ ${
          t.params.map((t: any, i: number) => 
            `${msgs[i]}: { type: ${args[i].c}, value: ${args[i].id ? `${t.name}._id` : t.name} }`
          ).join(', ')} }`
    }, ${ret.c})`

    return `${t.static ? 'static ' : ''}${methodName}(${
      t.params.map((t: any, i: number) =>
        `${t.name}: ${args[i].ts}`
      ).join(', ')
    }) { return ${ret.id ? `${ret.this ? 'this._instancetype' : `new ${ret.ts}`}(${msgSendExp})` : msgSendExp} }`
  }).join('\n')
}

function genProperties(properties: any[], ast: any, ident: string, filter: string) {
  return properties.filter((t: any) => !t.deprecated && (filter ? t.name.includes(filter) : true)).map((t: any) => {
    const type = astTypeToTSType(t.type, ast)
    const uppercased = t.name.charAt(0).toUpperCase() + t.name.slice(1)
    const target = t.static ? `getClass('${ident}')` : 'this._id'
    const getterMsgSendExp = `msgSend(${target}, '${t.name}', ${type.c})`
    const setterMsgSendExp = `msgSend(${target}, { set${uppercased}: { type: ${type.c}, value: ${type.id ? 'v._id' : 'v'} } }, ${type.c})`
    const getter = `${t.static ? 'static ' : ''}get ${t.name}() { return ${type.id ? `new ${type.ts}(${getterMsgSendExp})` : getterMsgSendExp} }`
    const setter = `${t.static ? 'static ' : ''}set ${t.name}(v: ${type.ts}) { ${setterMsgSendExp} }`
    if (t.readonly) {
      return getter
    } else {
      return [getter, setter].join('\n')
    }
  }).join('\n')
}

function genStruct(struct: any[], ast: any, ident: string) {
  const fields = struct.map((t: any) => {
    const type = astTypeToTSType(t.type, ast)
    return `  ${t.name}: ${type.c}`
  }).join(',\n')
  return `export const ${ident} = defineStruct({
${fields}
})`
}

function astTypeToTSType(ty: any, ast: any): { ts: string, c: string, id?: boolean, this?: boolean } {
  const name = ty.desugaredQualType ?? ty.qualType
  const frags = name.split(' ')
  let isUnsigned = false
  let isStruct = false
  let isEnum = false
  let isPointer = false
  let isNamed = false
  let typeName = ''

  if (name.includes('^')) {
    // block
    return {
      ts: 'Buffer',
      c: 'CType.ptr'
    }
  } else if ([...name].filter(t => t === '*').length > 1) {
    // complex type
    return {
      ts: 'Buffer',
      c: 'CType.ptr'
    }
  } else if (ty.qualType.includes('instancetype')) {
    return {
      ts: 'this',
      c: 'CType.ptr',
      id: true,
      this: true
    }
  } else if (frags.includes('id')) {
    return {
      ts: 'Id',
      c: 'CType.ptr',
      id: true
    }
  } else if (frags.includes('SEL') || frags.some((t: string) => t.startsWith('id<')) || frags.some((t: string) => t.startsWith('Class<'))) {
    return {
      ts: 'Buffer',
      c: 'CType.ptr'
    }
  }

  while (frags.length > 0) {
    if (frags[0].startsWith('__')) {
      frags.shift()
      continue
    }

    switch(frags[0]) {
      case 'BOOL': {
        return {
          ts: 'number',
          c: 'CType.i8'
        }
      }
      case 'const': {
        break
      }
      case 'signed': {
        break
      }
      case 'unsigned': {
        isUnsigned = true
        break
      }
      case 'struct': {
        isStruct = true
        break
      }
      case 'enum': {
        isEnum = true
        break
      }
      case 'void': {
        return {
          c: 'CType.void',
          ts: 'void'
        }
      }
      case '*': {
        isPointer = true
        break
      }
      case 'long': {
        return {
          c: isUnsigned ? 'CType.u64' : 'CType.i64',
          ts: 'bigint'
        }
      }
      case 'int': {
        return {
          c: isUnsigned ? 'CType.u32' : 'CType.i32',
          ts: 'number'
        }
      }
      case 'short': {
        return {
          c: isUnsigned ? 'CType.u16' : 'CType.i16',
          ts: 'number'
        }
      }
      case 'char': {
        return {
          c: isUnsigned ? 'CType.u8' : 'CType.i8',
          ts: 'number'
        }
      }
      case 'double': {
        return {
          c: 'CType.f64',
          ts: 'number'
        }
      }
      case 'float': {
        return {
          c: 'CType.f32',
          ts: 'number'
        }
      }
      default: {
        isNamed = true
        typeName = frags[0]
        break
      }
    }
    frags.shift()
  }
  
  if (isNamed) {
    const origin = ast.inner.find((t: any) => t.id === ty.typeAliasDeclId)

    if (origin) {
      if (origin.fixedUnderlyingType) {
        return astTypeToTSType(origin.fixedUnderlyingType, ast)
      }
  
      if (origin.inner[0].kind === 'ElaboratedType') {
        const id = origin.inner[0].ownedTagDecl.id
        const refItem = ast.inner.find((t: any) => t.id === id)
        
        if (isEnum) {
          // console.log(ty, refItem)
          return {
            c: astTypeToTSType(refItem.fixedUnderlyingType, ast).c,
            ts: ty.qualType
          }
          // return astTypeToTSType(refItem.fixedUnderlyingType, ast)
        } else if (isStruct) {
          return {
            ts: `StructOf<typeof ${typeName}>`,
            c: typeName
          }
        } else {
          console.log(refItem.name, refItem.kind)
          throw 'unknonw'
        }
      }
    }
  }

  if (isPointer && isStruct) {
    return {
      ts: 'Buffer',
      c: 'CType.ptr',
    }
  } else if (isPointer) {
    const genericsToAny = (t: string) => {
      if (t.includes('<')) {
        const g = t.split(/[<>]/)
        return `${g[0]}<${g.slice(1).map((t: any) => 'any').join(', ')}>`
      } else {
        return t
      }
    }
    return {
      ts: genericsToAny(typeName),
      c: 'CType.ptr',
      id: true
    }
  } else if (isStruct) {
    return {
      ts: `StructOf<typeof ${typeName}>`,
      c: typeName
    }
  }

  console.log(ty)
  throw 'unknonw'
}