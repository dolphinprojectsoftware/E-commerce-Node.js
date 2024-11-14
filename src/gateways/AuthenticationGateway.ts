import { Service } from 'typedi'
import { TokenService } from '../services/TokenService'
import { HashService } from '../services/HashService'
import { PartnerRepository } from '../repositories/PartnerRepository'
import { Partner } from '../db/models/partner'

@Service()
export class AuthenticationGateway {
  constructor(
    private tokenService: TokenService,
    private hashService: HashService,
    private partnerRepository: PartnerRepository
  ) {
  }

  async register(username: string, email: string, password: string): Promise<string> {
    const hashedPassword = await this.hashService.hashPassword(password)
    await this.partnerRepository.save({ username, email, password: hashedPassword } as Partner)
    return this.tokenService.generateToken({ email })
  }

  async login(email: string, password: string): Promise<string | null> {
    const partner = await this.partnerRepository.findByEmail(email)
    if (partner && await this.hashService.comparePasswords(password, partner.password)) {
      return this.tokenService.generateToken({ email })
    }
    return null
  }
}
